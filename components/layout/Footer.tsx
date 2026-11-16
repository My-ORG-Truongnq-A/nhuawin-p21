import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ContactList } from "@/components/contact/ContactList";
import { getFooter, getSiteSettings } from "@/lib/content";
import { resolveLink } from "@/lib/nav/resolve-link";
import { Container } from "./Container";

/**
 * Footer (T1.4, REQ-07): logo đầy đủ rộng min(360px, 86vw) trên nền sáng (logo không có bản trắng),
 * NAP từ siteSettings, cột Khám phá / Hợp tác từ CMS, mạng xã hội chỉ khi đã xác nhận,
 * liên kết pháp lý (Chính sách bảo mật) chỉ khi trang đã publish (REQ-21) — CMS footer.legalLinks.
 */
export async function Footer() {
  const [settings, footer] = await Promise.all([getSiteSettings(), getFooter()]);
  const socials = settings.socials.filter((s) => s.confirmed);
  const owner = settings.legalName ?? settings.brandName;

  return (
    <footer className="mt-auto border-t border-line bg-surface-2">
      <Container className="grid gap-10 py-section md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo settings={settings} placement="footer" />
          {settings.legalName && <p className="font-semibold text-ink">{settings.legalName}</p>}
          {footer.showContact && <ContactList settings={settings} />}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-3 text-sm">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener" className="font-semibold text-brand-ink underline underline-offset-2">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footer.columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-label text-muted">{col.title}</h2>
            <ul className="space-y-1">
              {col.items.map((item, i) => {
                const { href, external } = resolveLink(item.link);
                return (
                  <li key={`${item.label}-${i}`}>
                    <Link
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener" } : {})}
                      className="inline-flex min-h-11 items-center text-sm text-body hover:text-brand-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="bg-ink-950 text-cyan-200">
        <Container className="flex flex-col gap-2 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {owner}. Bảo lưu mọi quyền.</p>
          {footer.legalLinks.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {footer.legalLinks.map((l) => (
                <li key={l.label}>
                  <Link href={resolveLink(l.link).href} className="underline underline-offset-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </footer>
  );
}
