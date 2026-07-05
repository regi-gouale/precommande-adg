import { NextResponse } from "next/server";
import Stripe from "stripe";

import { log } from "@/lib/logger";
import { reconcilePaidCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id manquant" },
        { status: 400 },
      );
    }

    const result = await reconcilePaidCheckoutSession(sessionId);

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      return NextResponse.json(
        { error: "Session Stripe introuvable" },
        { status: 404 },
      );
    }

    log.error("Erreur réconciliation checkout Stripe", {
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      { error: "Erreur lors de la réconciliation Stripe" },
      { status: 500 },
    );
  }
}
