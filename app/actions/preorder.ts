"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, createActionError } from "@/lib/actions";
import {
  hasPreorderEnv,
  MissingEnvironmentError,
  missingPreorderEnvKeys,
} from "@/lib/env";
import { log } from "@/lib/logger";
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

export async function createPreorderCheckout(
  formData: FormData,
): Promise<ActionResult> {
  // Validation des données du formulaire
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
    log.warn("Validation du formulaire échouée", parsed.error);
    return createActionError(
      "Validation du formulaire échouée",
      parsed.error,
      "Veuillez remplir tous les champs correctement.",
    );
  }

  // Vérification de la configuration serveur
  if (!hasPreorderEnv) {
    log.error("Configuration serveur incomplète", {
      missing: missingPreorderEnvKeys,
    });
    return createActionError(
      "Configuration serveur incomplète",
      new Error(missingPreorderEnvKeys.join(", ")),
      "Configuration serveur incomplète. Veuillez contacter l'administrateur.",
    );
  }

  // Récupération du client Prisma
  let prisma: ReturnType<typeof getPrisma>;
  try {
    prisma = getPrisma();
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      return createActionError(
        "Variables d'environnement manquantes",
        error,
        "Configuration serveur incomplète. Veuillez contacter l'administrateur.",
      );
    }
    throw error;
  }

  // Création de la commande
  let order: Awaited<ReturnType<typeof prisma.order.create>>;
  try {
    order = await prisma.order.create({
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

    log.info("Commande créée", { orderId: order.id });
  } catch (error) {
    return createActionError(
      "Erreur lors de la création de la commande",
      error,
      "Impossible de créer votre commande. Veuillez réessayer.",
    );
  }

  // Historique du statut
  try {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        toStatus: "PENDING_PAYMENT",
        note: "Commande créée avant paiement Stripe",
      },
    });
  } catch (error) {
    log.warn("Impossible de créer l'historique du statut", {
      orderId: order.id,
      error,
    });
    // Ne pas bloquer le flux si l'historique échoue
  }

  // Création de la session Stripe
  let checkoutSession: Awaited<ReturnType<typeof createPreorderCheckoutSession>>;
  try {
    checkoutSession = await createPreorderCheckoutSession({
      orderId: order.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      shippingAddress:
        parsed.data.shippingAddress ?? "Retrait - Camp Impact Conférence",
      offerSlug: parsed.data.offerSlug,
      quantity: parsed.data.quantity,
    });

    log.info("Session Stripe créée", {
      orderId: order.id,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    // Mettre à jour la commande avec le statut CANCELLED pour marqueur d'erreur
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
    } catch (updateError) {
      log.error("Impossible de mettre à jour le statut de la commande", {
        orderId: order.id,
        updateError,
      });
    }

    return createActionError(
      "Erreur lors de la création de la session de paiement Stripe",
      error,
      "Impossible de créer votre session de paiement. Veuillez réessayer.",
    );
  }

  // Mise à jour de la commande avec les références Stripe
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        polarReferenceId: order.id,
        polarCheckoutId: checkoutSession.id,
      },
    });
  } catch (error) {
    log.error("Impossible de mettre à jour les références Stripe", {
      orderId: order.id,
      sessionId: checkoutSession.id,
      error,
    });
    return createActionError(
      "Erreur lors de la mise à jour de la commande",
      error,
      "Impossible de mettre à jour votre commande. Veuillez réessayer.",
    );
  }

  // Récupération de l'URL de checkout
  const checkoutUrl = checkoutSession.url;
  if (!checkoutUrl) {
    return createActionError(
      "URL de checkout manquante de Stripe",
      new Error("checkout_session.url est null"),
      "Impossible de générer le lien de paiement. Veuillez réessayer.",
    );
  }

  log.info("Redirection vers Stripe", {
    orderId: order.id,
    checkoutUrl,
  });

  // Redirection vers Stripe
  redirect(checkoutUrl);
}
