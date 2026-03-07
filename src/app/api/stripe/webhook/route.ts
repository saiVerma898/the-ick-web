import Stripe from "stripe";
import { NextResponse } from "next/server";
import { sendTikTokServerEvent } from "@/lib/tiktok-events";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { maxNetworkRetries: 0 });
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const isPaid = session.payment_status === "paid";

      if (isPaid) {
        const amountValue =
          typeof session.amount_total === "number"
            ? session.amount_total / 100
            : undefined;
        const currencyCode =
          typeof session.currency === "string" ? session.currency : undefined;

        try {
          await sendTikTokServerEvent({
            event: "Purchase",
            eventId: `purchase_${session.id}`,
            eventTimeUnix: event.created,
            request,
            url: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/paywall/success`
              : undefined,
            userId: session.metadata?.userId || null,
            email: session.customer_details?.email || null,
            ttclid: session.metadata?.ttclid || null,
            ttp: session.metadata?.ttp || null,
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
          console.error("TikTok webhook Purchase event error:", tiktokError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook handler error";
    console.error("Stripe webhook handling failed:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
