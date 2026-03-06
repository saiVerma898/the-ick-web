import Stripe from "stripe";
import { NextResponse } from "next/server";
import { sendTikTokServerEvent } from "@/lib/tiktok-events";

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
    const tiktokEventId = body?.tiktokEventId as string | undefined;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const dedupEventId =
      tiktokEventId?.trim() || `complete_payment_${session.id}`;

    if (session.payment_status === "paid") {
      const amountValue =
        typeof session.amount_total === "number"
          ? session.amount_total / 100
          : undefined;
      const currencyCode =
        typeof session.currency === "string" ? session.currency : undefined;

      try {
        await sendTikTokServerEvent({
          event: "CompletePayment",
          eventId: dedupEventId,
          request,
          url: request.headers.get("referer") || undefined,
          userId: session.metadata?.userId || null,
          email: session.customer_details?.email || null,
          value: amountValue,
          currency: currencyCode,
          properties: {
            content_type: "product",
            content_id: session.id,
          },
        });
      } catch (tiktokError) {
        console.error("TikTok payment event error:", tiktokError);
      }
    }

    return NextResponse.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      metadata: session.metadata || {},
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      tiktok_event_id: dedupEventId,
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
