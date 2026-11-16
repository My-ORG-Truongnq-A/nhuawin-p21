import type { ReactNode } from "react";
import { fontSans, fontSpec } from "@/app/fonts";
import { FloatingContact } from "@/components/contact/FloatingContact";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { DESIGN_VARIANT } from "@/content/features";
import { contentSource } from "@/lib/content";
import { HTML_LANG } from "@/lib/i18n";
import { MOTION_BOOT_SCRIPT } from "@/lib/motion";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MAIN_ID, SkipLink } from "./SkipLink";

/**
 * Vỏ HTML của site công khai: <html lang="vi">, skip link, header, footer, nút liên hệ nổi (T1.2).
 * Dùng chung cho app/(site)/layout.tsx và app/global-not-found.tsx (404 có đủ header/footer).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <html
      lang={HTML_LANG}
      data-variant={DESIGN_VARIANT}
      className={`${fontSans.variable} ${fontSpec.variable}`}
      // Script inline gắn class "js" trước khi hydrate.
      suppressHydrationWarning
    >
      {/* data-content-source: cờ "đang dùng seed" để kiểm go-live (GL-02). */}
      <body className="flex min-h-dvh flex-col" data-content-source={contentSource()}>
        {/* Script đồng bộ đầu <body>: gắn class "js" trước khi nội dung phía sau được vẽ (GD-04). */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
        <SkipLink />
        <Header />
        <main id={MAIN_ID} tabIndex={-1} className="flex-1 focus:shadow-none">
          {children}
        </main>
        <Footer />
        <FloatingContact />
        <RevealObserver />
      </body>
    </html>
  );
}
