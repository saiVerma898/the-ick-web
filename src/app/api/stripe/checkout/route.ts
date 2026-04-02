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
    const trackedUsername =
      typeof body?.trackedUsername === "string"
        ? body.trackedUsername.trim()
        : "";
    const tiktokEventId = body?.tiktokEventId as string | undefined;
    const contentName =
      typeof body?.contentName === "string" ? body.contentName.trim() : "";
    const ttclid =
      typeof body?.ttclid === "string" ? body.ttclid.trim() : undefined;
    const ttp = typeof body?.ttp === "string" ? body.ttp.trim() : undefined;
    const url = typeof body?.url === "string" ? body.url.trim() : undefined;
    const eventTimeUnix =
      typeof body?.eventTimeUnix === "number" &&
      Number.isFinite(body.eventTimeUnix)
        ? body.eventTimeUnix
        : undefined;
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
    const metadata: Record<string, string> = { priceId };
    if (userId?.trim()) {
      metadata.userId = userId.trim();
    }
    if (contentName) {
      metadata.contentName = contentName;
    }
    if (trackedUsername) {
      metadata.trackedUsername = trackedUsername;
    }
    if (ttclid) {
      metadata.ttclid = ttclid;
    }
    if (ttp) {
      metadata.ttp = ttp;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/paywall/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall/cancel`,
      metadata,
      allow_promotion_codes: true,
    });

    const dedupEventId = tiktokEventId?.trim() || `checkout_${session.id}`;

    try {
      await sendTikTokServerEvent({
        event: "InitiateCheckout",
        eventId: dedupEventId,
        request,
        eventTimeUnix,
        url: url || `${origin}/paywall`,
        userId: userId || null,
        ttclid: ttclid || null,
        ttp: ttp || null,
        value,
        currency,
        properties: {
          content_type: "product",
          content_id: priceId,
          content_name: contentName || "subscription",
          quantity: 1,
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
