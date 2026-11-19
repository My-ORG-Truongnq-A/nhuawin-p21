import "./globals.css";
import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { SiteShell } from "@/components/layout/SiteShell";
import { getNotFoundPage, getSiteSettings } from "@/lib/content";

/**
 * URL không khớp route nào (vd /khong-ton-tai-abc, /en) → 404 thật, không redirect về trang chủ (KT-06, T4.10).
 * Site có hai root layout ((site), (studio)) nên dùng global-not-found; vỏ dựng lại bằng SiteShell
 * để vẫn có header, footer, nút nổi. Next tự chèn meta robots noindex.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getNotFoundPage()]);
  return { title: `${page.title} | ${settings.brandName}` };
}

export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
