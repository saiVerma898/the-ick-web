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

  window.ttq?.track?.(event, properties, options);
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
