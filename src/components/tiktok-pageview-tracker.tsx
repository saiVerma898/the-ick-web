"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackTikTokPageView } from "@/lib/tiktok-browser";

export default function TikTokPageViewTracker() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    // Base pixel already fires page() on initial load.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    trackTikTokPageView();
  }, [pathname]);

  return null;
}
