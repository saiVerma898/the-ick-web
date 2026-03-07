type TikTokEventProperties = Record<string, unknown>;

type TikTokEventOptions = {
  event_id?: string;
};

type TikTokQueue = {
  page?: () => void;
  track?: (
    event: string,
    properties?: TikTokEventProperties,
    options?: TikTokEventOptions
  ) => void;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
  }
}

export function trackTikTokEvent(
  event: string,
  properties?: TikTokEventProperties,
  options?: TikTokEventOptions
) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedProperties = normalizeTikTokProperties(properties, options);
  window.ttq?.track?.(event, normalizedProperties, options);
}

export function trackTikTokPageView() {
  if (typeof window === "undefined") {
    return;
  }

  window.ttq?.page?.();
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`)
  );

  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function getTikTokAttributionContext() {
  if (typeof window === "undefined") {
    return {
      url: undefined,
      ttclid: undefined,
      ttp: undefined,
    };
  }

  const url = window.location.href;
  const params = new URLSearchParams(window.location.search);
  const ttclidFromQuery = params.get("ttclid")?.trim();

  if (ttclidFromQuery) {
    // Persist click ID so downstream API requests can include it.
    setCookie("ttclid", ttclidFromQuery, 60 * 60 * 24 * 90);
  }

  const ttclid = ttclidFromQuery || getCookieValue("ttclid");
  const ttp = getCookieValue("_ttp") || getCookieValue("ttp");

  return {
    url,
    ttclid: ttclid || undefined,
    ttp: ttp || undefined,
  };
}

export function createTikTokEventId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeTikTokProperties(
  properties: TikTokEventProperties | undefined,
  options: TikTokEventOptions | undefined
) {
  if (!properties) {
    return properties;
  }

  const normalized: TikTokEventProperties = { ...properties };
  const eventIdFallback = getNonEmptyString(options?.event_id);
  const topLevelContentId = getNonEmptyString(normalized.content_id);
  const resolvedContentId = topLevelContentId || eventIdFallback;

  if (resolvedContentId) {
    normalized.content_id = resolvedContentId;
  }

  if (!resolvedContentId) {
    return normalized;
  }

  const rawContents = normalized.contents;
  const defaultContentType = getNonEmptyString(normalized.content_type);
  const defaultContentName = getNonEmptyString(normalized.content_name);
  const defaultQuantity =
    typeof normalized.quantity === "number" && Number.isFinite(normalized.quantity)
      ? normalized.quantity
      : undefined;
  const defaultCurrency = getNonEmptyString(normalized.currency)?.toUpperCase();
  const defaultValue =
    typeof normalized.value === "number" && Number.isFinite(normalized.value)
      ? Number(normalized.value.toFixed(2))
      : undefined;

  if (Array.isArray(rawContents)) {
    normalized.contents = rawContents.map((item) => {
      const contentItem =
        item && typeof item === "object"
          ? { ...(item as Record<string, unknown>) }
          : {};

      if (!getNonEmptyString(contentItem.content_id)) {
        contentItem.content_id = resolvedContentId;
      }
      if (!getNonEmptyString(contentItem.content_type) && defaultContentType) {
        contentItem.content_type = defaultContentType;
      }

      return contentItem;
    });
    return normalized;
  }

  const autoContentItem: Record<string, unknown> = {
    content_id: resolvedContentId,
  };

  if (defaultContentType) {
    autoContentItem.content_type = defaultContentType;
  }
  if (defaultContentName) {
    autoContentItem.content_name = defaultContentName;
  }
  if (typeof defaultQuantity === "number") {
    autoContentItem.quantity = defaultQuantity;
  }
  if (defaultCurrency) {
    autoContentItem.currency = defaultCurrency;
  }
  if (typeof defaultValue === "number") {
    autoContentItem.price = defaultValue;
  }

  normalized.contents = [autoContentItem];
  return normalized;
}
