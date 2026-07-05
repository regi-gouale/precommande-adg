"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  hasPreorderEnv,
  MissingEnvironmentError,
  missingPreorderEnvKeys,
} from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { createPreorderCheckoutSession } from "@/lib/stripe";

const preorderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  shippingAddress: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(100),
  offerSlug: z.literal("livre-bonus"),
  cgvAccepted: z.literal("on"),
});

export async function createPreorderCheckout(formData: FormData) {
  const parsed = preorderSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    shippingAddress: formData.get("shippingAddress") || undefined,
    quantity: formData.get("quantity"),
    offerSlug: formData.get("offerSlug"),
    cgvAccepted: formData.get("cgvAccepted"),
  });

  if (!parsed.success) {
    throw new Error("Formulaire invalide");
  }

  if (!hasPreorderEnv) {
    throw new Error(
      `Configuration serveur incomplete: ${missingPreorderEnvKeys.join(", ")}`,
    );
  }

  let prisma: ReturnType<typeof getPrisma>;

  try {
    prisma = getPrisma();
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      throw new Error(
        "Configuration serveur incomplete: renseignez les variables d'environnement.",
      );
    }

    throw error;
  }

  const order = await prisma.order.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      shippingAddress:
        parsed.data.shippingAddress ?? "Retrait - Camp Impact Conférence",
      quantity: parsed.data.quantity,
      offerSlug: parsed.data.offerSlug,
      cgvAccepted: true,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      toStatus: "PENDING_PAYMENT",
      note: "Commande creee avant paiement Stripe",
    },
  });

  const checkoutSession = await createPreorderCheckoutSession({
    orderId: order.id,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    shippingAddress:
      parsed.data.shippingAddress ?? "Retrait - Camp Impact Conférence",
    offerSlug: parsed.data.offerSlug,
    quantity: parsed.data.quantity,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      polarReferenceId: order.id,
      polarCheckoutId: checkoutSession.id,
    },
  });

  const checkoutUrl = checkoutSession.url;

  if (!checkoutUrl) {
    throw new Error("Stripe n'a pas retourne d'URL de checkout.");
  }

  redirect(checkoutUrl);
}
