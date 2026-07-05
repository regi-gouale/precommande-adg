"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuth } from "@/lib/auth";
import { MissingEnvironmentError } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

const preorderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(100),
  offerSlug: z.enum(["livre-seul", "livre-bonus", "pack-livres"]),
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

  let prisma: ReturnType<typeof getPrisma>;
  let auth: ReturnType<typeof getAuth>;

  try {
    prisma = getPrisma();
    auth = getAuth();
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
      note: "Commande creee avant paiement Polar",
    },
  });

  const checkoutSession = await auth.api.checkout({
    headers: await headers(),
    body: {
      slug: parsed.data.offerSlug,
      referenceId: order.id,
      metadata: {
        orderId: order.id,
        referenceId: order.id,
        offerSlug: parsed.data.offerSlug,
        quantity: parsed.data.quantity,
      },
      successUrl: "/checkout/success?checkout_id={CHECKOUT_ID}",
      returnUrl: "/#precommande",
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      polarReferenceId: order.id,
    },
  });

  redirect(checkoutSession.url);
}
