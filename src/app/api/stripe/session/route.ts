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
    const ttclid =
      typeof body?.ttclid === "string" ? body.ttclid.trim() : undefined;
    const ttp = typeof body?.ttp === "string" ? body.ttp.trim() : undefined;
    const url = typeof body?.url === "string" ? body.url.trim() : undefined;
    const eventTimeUnix =
      typeof body?.eventTimeUnix === "number" &&
      Number.isFinite(body.eventTimeUnix)
        ? body.eventTimeUnix
        : undefined;
    const webhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const dedupEventId =
      tiktokEventId?.trim() || `purchase_${session.id}`;

    if (session.payment_status === "paid" && !webhookConfigured) {
      const amountValue =
        typeof session.amount_total === "number"
          ? session.amount_total / 100
          : undefined;
      const currencyCode =
        typeof session.currency === "string" ? session.currency : undefined;

      try {
        await sendTikTokServerEvent({
          event: "Purchase",
          eventId: dedupEventId,
          request,
          eventTimeUnix,
          url: url || request.headers.get("referer") || undefined,
          userId: session.metadata?.userId || null,
          email: session.customer_details?.email || null,
          ttclid: ttclid || session.metadata?.ttclid || null,
          ttp: ttp || session.metadata?.ttp || null,
          value: amountValue,
          currency: currencyCode,
          properties: {
            content_type: "product",
            content_id: session.id,
            content_name: session.metadata?.contentName || "subscription",
            quantity: 1,
          },
        });
      } catch (tiktokError) {
        console.error("TikTok fallback purchase event error:", tiktokError);
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
