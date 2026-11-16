/**
 * /llms.txt (T2.6, GEO-05): tóm tắt doanh nghiệp + link trang chính + bài viết, sinh từ CMS.
 * Không thêm claim nào ngoài dữ liệu siteSettings (REQ-14).
 */
import type { SiteRoute } from "@/content/routes";
import type { PostSummary, SiteSettings } from "@/lib/content/types";
import { absoluteUrl } from "@/lib/site-url";

export function buildLlmsTxt(opts: {
  settings: SiteSettings;
  siteUrl: string;
  routes: SiteRoute[];
  posts: PostSummary[];
}): string {
  const { settings: s, siteUrl } = opts;
  const lines: string[] = [`# ${s.brandName}`, ""];
  if (s.description) lines.push(`> ${s.description}`, "");

  const facts: string[] = [];
  if (s.legalName) facts.push(`Tên pháp lý: ${s.legalName}`);
  if (s.slogan) facts.push(`Khẩu hiệu: ${s.slogan}`);
  const addr = [s.address?.street, s.address?.locality].filter(Boolean).join(", ");
  if (addr) facts.push(`Địa chỉ: ${addr}`);
  if (s.phones.length) facts.push(`Điện thoại: ${s.phones.map((p) => p.number).join(" · ")}`);
  if (s.email) facts.push(`Email: ${s.email}`);
  if (s.openingHours.length) {
    facts.push(`Giờ làm việc: ${s.openingHours.map((h) => `${h.label} ${h.opens}–${h.closes}`).join("; ")}`);
  }
  if (s.areaServed) facts.push(`Khu vực phục vụ: ${s.areaServed}`);
  facts.push(`Website: ${siteUrl}`);
  lines.push("## Thông tin nhanh", "", ...facts.map((f) => `- ${f}`), "");

  const pages = opts.routes.filter((r) => r.enabled && !r.noindex);
  lines.push("## Trang chính", "", ...pages.map((r) => `- [${r.title}](${absoluteUrl(r.path, siteUrl)})`), "");

  const posts = opts.posts.filter((p) => !p.noindex);
  if (posts.length) {
    lines.push(
      "## Bài viết",
      "",
      ...posts.map((p) => `- [${p.title}](${absoluteUrl(`/tin-tuc/${p.slug}`, siteUrl)})${p.excerpt ? `: ${p.excerpt}` : ""}`),
      "",
    );
  }
  return lines.join("\n");
}
