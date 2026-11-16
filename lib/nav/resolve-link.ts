import type { CmsLink } from "@/lib/content/types";

/** Link CMS → href dùng trong <a>/<Link>. Menu đọc từ CMS, không sửa code khi đổi nhãn / thứ tự. */
export function resolveLink(link: CmsLink): { href: string; external: boolean } {
  // http(s) mở tab mới; tel: (link Gọi số chính) mở tại chỗ.
  if (link.kind === "external") return { href: link.url, external: /^https?:\/\//i.test(link.url) };
  const anchor = link.anchor?.replace(/^#/, "");
  return { href: anchor ? `${link.path}#${anchor}` : link.path, external: false };
}

/** Mục menu ứng với trang hiện tại (aria-current="page"). Link có anchor không tính là trang. */
export function isCurrent(pathname: string, link: CmsLink): boolean {
  if (link.kind !== "internal" || link.anchor) return false;
  if (link.path === "/") return pathname === "/";
  return pathname === link.path || pathname.startsWith(`${link.path}/`);
}
