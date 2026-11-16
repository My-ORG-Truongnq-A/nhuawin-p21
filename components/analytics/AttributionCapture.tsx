"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_MAX_AGE,
  FIRST_TOUCH_COOKIE,
  LAST_TOUCH_COOKIE,
  nextAttribution,
  parseTouch,
  serializeTouch,
  touchFromVisit,
} from "@/lib/leads/attribution";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);

/**
 * Ghi nguồn lead (LD-05) ở lượt tải trang đầy đủ (layout giữ nguyên khi điều hướng nội bộ):
 * first-touch giữ nguyên, last non-direct thay cả bộ. Server action đọc 2 cookie này khi gửi lead.
 */
export function AttributionCapture() {
  useEffect(() => {
    const cur = { ft: parseTouch(readCookie(FIRST_TOUCH_COOKIE)), lt: parseTouch(readCookie(LAST_TOUCH_COOKIE)) };
    const next = nextAttribution(cur, touchFromVisit(window.location.href, document.referrer, new Date()));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    for (const w of next.write) {
      const touch = w === "ft" ? next.ft : next.lt;
      if (!touch) continue;
      const name = w === "ft" ? FIRST_TOUCH_COOKIE : LAST_TOUCH_COOKIE;
      document.cookie = `${name}=${serializeTouch(touch)}; Max-Age=${ATTRIBUTION_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    }
  }, []);
  return null;
}
