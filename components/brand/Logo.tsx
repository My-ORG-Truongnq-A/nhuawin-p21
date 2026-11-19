import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/content/types";

/**
 * Logo nguyên ảnh từ siteSettings.logo (GD-06): chỉ đặt chiều cao (header) hoặc chiều rộng (footer),
 * không crop, không ghép chữ HTML. Thiếu ảnh trong CMS → hiện tên thương hiệu dạng chữ (tạm, ghi deviations).
 */
export function Logo({
  settings,
  placement,
  preload = false,
}: {
  settings: Pick<SiteSettings, "brandName" | "logo">;
  placement: "header" | "footer";
  preload?: boolean;
}) {
  const { logo, brandName } = settings;
  const sizeClass = placement === "header" ? "h-logo-header w-auto" : "h-auto w-[var(--logo-footer-w)]";
  const sizes = placement === "header" ? "(min-width: 64rem) 116px, 91px" : "(min-width: 420px) 360px, 86vw";

  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`Logo ${brandName} — về trang chủ`}>
      {logo ? (
        <Image
          src={logo.url}
          width={logo.width}
          height={logo.height}
          alt={`Logo ${brandName} — về trang chủ`}
          sizes={sizes}
          preload={preload}
          className={sizeClass}
        />
      ) : (
        <span className="font-display text-lg font-extrabold text-brand-ink">{brandName}</span>
      )}
    </Link>
  );
}
