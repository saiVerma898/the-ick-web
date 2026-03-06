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
    const priceId = body?.priceId as string | undefined;
    const userId = body?.userId as string | undefined;
    const tiktokEventId = body?.tiktokEventId as string | undefined;
    const value =
      typeof body?.value === "number" && Number.isFinite(body.value)
        ? body.value
        : undefined;
    const currency =
      typeof body?.currency === "string" ? body.currency : "USD";

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.theickk.com";

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/paywall/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall/cancel`,
      metadata: userId ? { userId } : undefined,
      allow_promotion_codes: true,
    });

    const dedupEventId = tiktokEventId?.trim() || `checkout_${session.id}`;

    try {
      await sendTikTokServerEvent({
        event: "InitiateCheckout",
        eventId: dedupEventId,
        request,
        url: `${origin}/paywall`,
        userId: userId || null,
        value,
        currency,
        properties: {
          content_type: "product",
          content_id: priceId,
        },
      });
    } catch (tiktokError) {
      console.error("TikTok checkout event error:", tiktokError);
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe checkout error:", message, error);
    return NextResponse.json(
      { error: "Stripe checkout failed", details: message },
      { status: 500 }
    );
  }
}
