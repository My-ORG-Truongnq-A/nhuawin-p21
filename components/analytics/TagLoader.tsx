"use client";

import { useEffect } from "react";
import { hasAdClickId } from "@/lib/analytics/config";

const INTERACTIONS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
const IDLE_MS = 4000;

/**
 * Nạp thư viện GTM / gtag trễ (HN-05): ở tương tác đầu hoặc sau ~4 s; URL có click ID quảng cáo → nạp ngay.
 * Hàng đợi `dataLayer` đã dựng sẵn bằng script inline nên sự kiện trước đó không mất.
 */
export function TagLoader({ src }: { src: string }) {
  useEffect(() => {
    const inject = () => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const s = document.createElement("script");
      s.async = true;
      s.src = src;
      document.head.appendChild(s);
    };
    if (hasAdClickId(window.location.search)) {
      inject();
      return;
    }
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const cleanup = () => {
      window.clearTimeout(timer);
      for (const e of INTERACTIONS) window.removeEventListener(e, load, opts);
    };
    const load = () => {
      cleanup();
      inject();
    };
    const timer = window.setTimeout(load, IDLE_MS);
    for (const e of INTERACTIONS) window.addEventListener(e, load, opts);
    return cleanup;
  }, [src]);
  return null;
}
