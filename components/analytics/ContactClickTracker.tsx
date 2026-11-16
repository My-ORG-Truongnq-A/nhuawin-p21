"use client";

import { useEffect } from "react";
import { classifyContactHref, trackEvent } from "@/lib/analytics/events";

/** Vị trí link (TR-03): `data-track-area` › id section gần nhất › `aria-label`. */
function linkLocation(a: HTMLAnchorElement): string {
  const area = a.closest<HTMLElement>("[data-track-area]")?.dataset.trackArea;
  if (area) return area;
  const section = a.closest("section[id], header, footer, nav[aria-label]");
  if (section?.id) return section.id;
  if (section && section.tagName !== "SECTION") return section.tagName.toLowerCase();
  return a.getAttribute("aria-label") ?? "unknown";
}

/** Một listener ở document (pha capture) đo click_phone / click_zalo / … — nút mới đúng định dạng tự được đo. */
export function ContactClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const name = classifyContactHref(a.href);
      if (name) trackEvent(window, name, { link_location: linkLocation(a), page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
