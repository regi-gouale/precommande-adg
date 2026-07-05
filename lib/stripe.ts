import Stripe from "stripe";

import { sendPreorderConfirmationEmail } from "@/lib/email";
import {
  env,
  hasStripeCheckoutEnv,
  missingStripeCheckoutEnvKeys,
} from "@/lib/env";
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
    throw new Error("Offre de precommande invalide.");
  }

  return env.STRIPE_PRICE_BOOK_BONUS;
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
  if (!hasStripeCheckoutEnv) {
    throw new Error(
      `Configuration Stripe incomplete: ${missingStripeCheckoutEnvKeys.join(
        ", ",
      )}`,
    );
  }

  const stripeClient = getStripeClient();
  const priceId = getStripePriceIdForOffer(input.offerSlug);
  const metadata = buildPreorderCheckoutMetadata(input);

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
    throw new Error("Stripe n'a pas retourne d'URL de checkout.");
  }

  return session;
}

type StripeMetadata = Record<string, string> | null | undefined;

function getMetadataOrderId(metadata: StripeMetadata) {
  return typeof metadata?.orderId === "string" ? metadata.orderId : undefined;
}

async function confirmPaidOrderFromMetadata(
  metadata: StripeMetadata,
  externalPaymentId: string,
  checkoutSessionId?: string,
) {
  const orderId = getMetadataOrderId(metadata);

  if (!orderId) {
    return;
  }

  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.paymentStatus === "PAID") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PREORDER_CONFIRMED",
        paidAt: new Date(),
        polarOrderId: externalPaymentId,
        polarCheckoutId: checkoutSessionId ?? externalPaymentId,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "PREORDER_CONFIRMED",
        note: "Paiement confirme par webhook Stripe",
      },
    });
  });

  await sendPreorderConfirmationEmail({
    to: order.email,
    firstName: order.firstName,
    orderId: order.id,
  });
}

export async function handleStripeEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? event.id);

    await confirmPaidOrderFromMetadata(
      session.metadata,
      paymentIntentId,
      session.id,
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
}
