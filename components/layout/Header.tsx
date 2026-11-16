import { Logo } from "@/components/brand/Logo";
import { getHeader, getSiteSettings } from "@/lib/content";
import { Container } from "./Container";
import { HeaderNav } from "./HeaderNav";

/**
 * Header dính (T1.3): logo từ siteSettings, menu từ singleton header, nút Nhận báo giá luôn thấy.
 * Không dùng backdrop-filter: nó biến header thành containing block của menu mobile (fixed) → panel cao 0.
 */
export async function Header() {
  const [settings, header] = await Promise.all([getSiteSettings(), getHeader()]);
  return (
    <header className="sticky top-0 z-40 h-header border-b border-line bg-surface">
      <Container className="flex h-full items-center gap-3">
        <Logo settings={settings} placement="header" preload />
        <HeaderNav items={header.items} cta={header.cta} />
      </Container>
    </header>
  );
}
