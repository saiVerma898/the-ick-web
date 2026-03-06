import { createHash } from "node:crypto";

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

type TikTokServerEventInput = {
  event: "InitiateCheckout" | "CompletePayment";
  eventId: string;
  request: Request;
  url?: string;
  userId?: string | null;
  email?: string | null;
  value?: number;
  currency?: string;
  properties?: Record<string, unknown>;
};

function hashForTikTok(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    return firstIp?.trim();
  }

  return request.headers.get("x-real-ip")?.trim();
}

export async function sendTikTokServerEvent(input: TikTokServerEventInput) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  const pixelId =
    process.env.TIKTOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();

  if (!accessToken || !pixelId) {
    return;
  }

  const clientIpAddress = getClientIp(input.request);
  const clientUserAgent = input.request.headers.get("user-agent") || undefined;
  const normalizedEmail = input.email ? normalizeEmail(input.email) : undefined;
  const externalId = input.userId?.trim();

  const userPayload: Record<string, unknown> = {};
  if (clientIpAddress) {
    userPayload.client_ip_address = clientIpAddress;
  }
  if (clientUserAgent) {
    userPayload.client_user_agent = clientUserAgent;
  }
  if (normalizedEmail) {
    userPayload.email = hashForTikTok(normalizedEmail);
  }
  if (externalId) {
    userPayload.external_id = hashForTikTok(externalId);
  }

  const properties: Record<string, unknown> = { ...input.properties };
  if (typeof input.value === "number" && Number.isFinite(input.value)) {
    properties.value = Number(input.value.toFixed(2));
  }
  if (input.currency) {
    properties.currency = input.currency.toUpperCase();
  }

  const eventPayload: Record<string, unknown> = {
    event: input.event,
    event_id: input.eventId,
    event_time: Math.floor(Date.now() / 1000),
  };

  if (Object.keys(userPayload).length > 0) {
    eventPayload.user = userPayload;
  }
  if (Object.keys(properties).length > 0) {
    eventPayload.properties = properties;
  }
  if (input.url) {
    eventPayload.page = { url: input.url };
  }

  const payload: Record<string, unknown> = {
    event_source: "web",
    event_source_id: pixelId,
    data: [eventPayload],
  };

  const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE?.trim();
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const response = await fetch(TIKTOK_EVENTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": accessToken,
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `TikTok Events API error (${response.status}): ${body.slice(0, 500)}`
    );
  }
}
