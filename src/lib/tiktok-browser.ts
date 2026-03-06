type TikTokEventProperties = Record<string, unknown>;

type TikTokEventOptions = {
  event_id?: string;
};

type TikTokQueue = {
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
