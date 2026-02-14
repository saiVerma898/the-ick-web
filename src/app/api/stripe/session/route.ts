import Stripe from "stripe";
import { NextResponse } from "next/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { maxNetworkRetries: 0 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId as string | undefined;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      metadata: session.metadata || {},
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe session error:", message, error);
    return NextResponse.json(
      { error: "Stripe session lookup failed", details: message },
      { status: 500 }
    );
  }
}
