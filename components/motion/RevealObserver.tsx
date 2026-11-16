"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { REVEAL_ROOT_MARGIN } from "@/lib/motion";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Một observer cho cả trang: phần tử có `data-reveal` hiện dần khi gần vào khung nhìn (GD-04).
 * Không dùng thư viện motion (HN-06). Không gắn `data-reveal` cho phần tử LCP (HN-02).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    window.__revealReady = true;
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
