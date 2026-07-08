import Stripe from "stripe";

import {
  env,
  hasStripeCheckoutEnv,
  missingStripeCheckoutEnvKeys,
} from "@/lib/env";
import { log } from "@/lib/logger";
import { getPrisma } from "@/lib/prisma";

export type PreorderOfferSlug = "livre-bonus";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

const globalForStripe = globalThis as unknown as {
  stripeClient: Stripe | undefined;
};

export function getStripeClient() {
  if (globalForStripe.stripeClient) {
    return globalForStripe.stripeClient;
  }

  const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripeClient = stripeClient;
  }

  return stripeClient;
}

export function getStripePriceIdForOffer(offerSlug: PreorderOfferSlug) {
  if (offerSlug !== "livre-bonus") {
    throw new Error("Offre de précommande invalide.");
  }

  const priceId = env.STRIPE_PRICE_BOOK_BONUS;

  if (!priceId.startsWith("price_")) {
    throw new Error(
      "STRIPE_PRICE_BOOK_BONUS doit contenir un Price ID Stripe (préfixe price_), pas un Product ID (prod_).",
    );
  }

  return priceId;
}

export function buildPreorderCheckoutMetadata(input: {
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  shippingAddress?: string | null;
  offerSlug: PreorderOfferSlug;
  quantity: number;
}) {
  return {
    orderId: input.orderId,
    referenceId: input.orderId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    offerSlug: input.offerSlug,
    quantity: String(input.quantity),
    shippingAddress: input.shippingAddress ?? "",
  };
}

export async function createPreorderCheckoutSession(input: {
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  shippingAddress?: string | null;
  offerSlug: PreorderOfferSlug;
  quantity: number;
}) {
  try {
    if (!hasStripeCheckoutEnv) {
      log.error("Configuration Stripe incomplète", {
        missing: missingStripeCheckoutEnvKeys,
      });
      throw new Error(
        `Configuration Stripe incomplete: ${missingStripeCheckoutEnvKeys.join(
          ", ",
        )}`,
      );
    }

    const stripeClient = getStripeClient();
    const priceId = getStripePriceIdForOffer(input.offerSlug);
    const metadata = buildPreorderCheckoutMetadata(input);

    log.debug("Création de session Stripe", {
      orderId: input.orderId,
      quantity: input.quantity,
      email: input.email,
    });

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/#precommande`,
      line_items: [
        {
          price: priceId,
          quantity: input.quantity,
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
      },
    });

    if (!session.url) {
      log.error("URL de checkout manquante de Stripe", {
        sessionId: session.id,
      });
      throw new Error("Stripe n'a pas retourné d'URL de checkout.");
    }

    log.info("Session Stripe créée avec succès", {
      orderId: input.orderId,
      sessionId: session.id,
    });

    return session;
  } catch (error) {
    log.error("Erreur lors de la création de la session Stripe", {
      orderId: input.orderId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

type StripeMetadata = Record<string, string> | null | undefined;

type StripeInvoiceAmounts = {
  amountSubtotalCents?: number;
  amountTaxCents?: number;
  amountTotalCents?: number;
  currency?: string;
};

function getMetadataOrderId(metadata: StripeMetadata) {
  return typeof metadata?.orderId === "string" ? metadata.orderId : undefined;
}

async function confirmPaidOrderFromMetadata(
  metadata: StripeMetadata,
  externalPaymentId: string,
  checkoutSessionId?: string,
  invoiceAmounts?: StripeInvoiceAmounts,
) {
  try {
    const orderId = getMetadataOrderId(metadata);

    if (!orderId) {
      log.warn("Pas d'orderId trouvé dans les metadata Stripe", { metadata });
      return;
    }

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      log.error("Commande non trouvée", { orderId });
      return;
    }

    if (order.paymentStatus === "PAID") {
      log.info("Commande déjà payée", { orderId });
      return;
    }

    const paidAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PREORDER_CONFIRMED",
          paidAt,
          polarOrderId: externalPaymentId,
          polarCheckoutId: checkoutSessionId ?? externalPaymentId,
          amountCents: invoiceAmounts?.amountTotalCents ?? order.amountCents,
          currency: invoiceAmounts?.currency ?? order.currency,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "PREORDER_CONFIRMED",
          note: "Paiement confirmé par webhook Stripe",
        },
      });
    });

    log.info("Commande confirmée après paiement", { orderId });

    const { sendPaidOrderEmails } = await import("@/lib/email");

    await sendPaidOrderEmails({
      orderId: order.id,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      quantity: order.quantity,
      offerSlug: order.offerSlug,
      amountCents: order.amountCents,
      currency: order.currency,
      amountSubtotalCents: invoiceAmounts?.amountSubtotalCents,
      amountTaxCents: invoiceAmounts?.amountTaxCents,
      amountTotalCents: invoiceAmounts?.amountTotalCents,
      paidAt,
      paymentIntentId: externalPaymentId,
      checkoutSessionId,
    });
  } catch (error) {
    log.error("Erreur lors de la confirmation du paiement", {
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        log.debug("Session non payée, ignorée", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        });
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? event.id);

      const invoiceAmounts: StripeInvoiceAmounts = {
        amountSubtotalCents:
          typeof session.amount_subtotal === "number"
            ? session.amount_subtotal
            : undefined,
        amountTaxCents:
          typeof session.total_details?.amount_tax === "number"
            ? session.total_details.amount_tax
            : undefined,
        amountTotalCents:
          typeof session.amount_total === "number"
            ? session.amount_total
            : undefined,
        currency:
          typeof session.currency === "string"
            ? session.currency
            : undefined,
      };

      await confirmPaidOrderFromMetadata(
        session.metadata,
        paymentIntentId,
        session.id,
        invoiceAmounts,
      );
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await confirmPaidOrderFromMetadata(
        paymentIntent.metadata,
        paymentIntent.id,
      );
    }
  } catch (error) {
    log.error("Erreur lors du traitement de l'événement Stripe", {
      eventType: event.type,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

export async function reconcilePaidCheckoutSession(checkoutSessionId: string) {
  const stripeClient = getStripeClient();
  const session = await stripeClient.checkout.sessions.retrieve(
    checkoutSessionId,
    {
      expand: ["payment_intent"],
    },
  );

  if (session.payment_status !== "paid") {
    log.info("Session Stripe non payee, reconciliation ignoree", {
      sessionId: checkoutSessionId,
      status: session.status,
      paymentStatus: session.payment_status,
    });

    return {
      reconciled: false,
      reason: "not_paid" as const,
    };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  const invoiceAmounts: StripeInvoiceAmounts = {
    amountSubtotalCents:
      typeof session.amount_subtotal === "number"
        ? session.amount_subtotal
        : undefined,
    amountTaxCents:
      typeof session.total_details?.amount_tax === "number"
        ? session.total_details.amount_tax
        : undefined,
    amountTotalCents:
      typeof session.amount_total === "number" ? session.amount_total : undefined,
    currency: typeof session.currency === "string" ? session.currency : undefined,
  };

  await confirmPaidOrderFromMetadata(
    session.metadata,
    paymentIntentId,
    session.id,
    invoiceAmounts,
  );

  return {
    reconciled: true,
    reason: "paid" as const,
  };
}
