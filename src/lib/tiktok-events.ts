import { createHash } from "node:crypto";

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

type TikTokEventName =
  | "ViewContent"
  | "AddToWishlist"
  | "Search"
  | "AddPaymentInfo"
  | "AddToCart"
  | "InitiateCheckout"
  | "PlaceAnOrder"
  | "CompleteRegistration"
  | "Purchase"
  | "CompletePayment";

type TikTokServerEventInput = {
  event: TikTokEventName;
  eventId: string;
  request: Request;
  eventTimeUnix?: number;
  url?: string;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  ttclid?: string | null;
  ttp?: string | null;
  ip?: string | null;
  userAgent?: string | null;
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

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    return firstIp?.trim();
  }

  return request.headers.get("x-real-ip")?.trim();
}

function getCookieValue(request: Request, key: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${escapedKey}=([^;]*)`)
  );

  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function getQueryParamFromUrl(rawUrl: string | undefined, key: string) {
  if (!rawUrl) {
    return undefined;
  }

  try {
    const parsed = new URL(rawUrl);
    const value = parsed.searchParams.get(key)?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

function getNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function sendTikTokServerEvent(input: TikTokServerEventInput) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  const pixelId =
    process.env.TIKTOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();

  if (!accessToken || !pixelId) {
    return;
  }

  const requestReferer = input.request.headers.get("referer") || undefined;
  const resolvedUrl = input.url?.trim() || requestReferer;
  const clientIpAddress = input.ip?.trim() || getClientIp(input.request);
  const clientUserAgent =
    input.userAgent?.trim() ||
    input.request.headers.get("user-agent") ||
    undefined;
  const normalizedEmail = input.email ? normalizeEmail(input.email) : undefined;
  const normalizedPhone = input.phone ? normalizePhone(input.phone) : undefined;
  const externalId = input.userId?.trim();
  const ttclid =
    input.ttclid?.trim() ||
    getQueryParamFromUrl(input.request.url, "ttclid") ||
    getQueryParamFromUrl(requestReferer, "ttclid") ||
    getCookieValue(input.request, "ttclid");
  const ttp =
    input.ttp?.trim() ||
    getCookieValue(input.request, "_ttp") ||
    getCookieValue(input.request, "ttp");

  const userPayload: Record<string, unknown> = {};
  if (clientIpAddress) {
    userPayload.ip = clientIpAddress;
  }
  if (clientUserAgent) {
    userPayload.user_agent = clientUserAgent;
  }
  if (normalizedEmail) {
    userPayload.email = hashForTikTok(normalizedEmail);
  }
  if (normalizedPhone) {
    userPayload.phone = hashForTikTok(normalizedPhone);
  }
  if (externalId) {
    userPayload.external_id = hashForTikTok(externalId);
  }
  if (ttclid) {
    userPayload.ttclid = ttclid;
  }
  if (ttp) {
    userPayload.ttp = ttp;
  }

  const properties: Record<string, unknown> = { ...input.properties };
  if (typeof input.value === "number" && Number.isFinite(input.value)) {
    properties.value = Number(input.value.toFixed(2));
  }
  if (input.currency) {
    properties.currency = input.currency.toUpperCase();
  }
  if (resolvedUrl) {
    properties.url = resolvedUrl;
  }
  const resolvedContentId =
    getNonEmptyString(properties.content_id) || input.eventId;
  properties.content_id = resolvedContentId;

  if (Array.isArray(properties.contents)) {
    properties.contents = properties.contents.map((item) => {
      const contentItem =
        item && typeof item === "object"
          ? { ...(item as Record<string, unknown>) }
          : {};

      if (!getNonEmptyString(contentItem.content_id)) {
        contentItem.content_id = resolvedContentId;
      }
      if (
        !getNonEmptyString(contentItem.content_type) &&
        getNonEmptyString(properties.content_type)
      ) {
        contentItem.content_type = getNonEmptyString(properties.content_type);
      }

      return contentItem;
    });
  }

  const eventPayload: Record<string, unknown> = {
    event: input.event,
    event_id: input.eventId,
    event_time: input.eventTimeUnix || Math.floor(Date.now() / 1000),
  };

  if (Object.keys(userPayload).length > 0) {
    eventPayload.user = userPayload;
  }
  if (Object.keys(properties).length > 0) {
    eventPayload.properties = properties;
  }
  if (resolvedUrl) {
    eventPayload.page = { url: resolvedUrl };
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
