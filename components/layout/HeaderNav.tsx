"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import type { NavItem } from "@/lib/content/types";
import { isCurrent, resolveLink } from "@/lib/nav/resolve-link";

/**
 * Menu chính + menu con + menu mobile (T1.3, REQ-17). Dữ liệu từ singleton header (CMS).
 * Mọi link nằm sẵn trong HTML (crawler đọc được, GD-05). Bàn phím: Tab tới mọi mục, Enter mở menu con,
 * Esc đóng menu con / menu mobile và trả focus về nút mở.
 */
export function HeaderNav({ items, cta }: { items: NavItem[]; cta?: NavItem }) {
  const pathname = usePathname();
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const subButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Đổi trang → đóng mọi menu (điều chỉnh state theo prop thay vì effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenSub(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (openSub === null && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButton.current?.focus();
      } else if (openSub !== null) {
        subButtons.current[openSub]?.focus();
        setOpenSub(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (openSub !== null && navRef.current && !navRef.current.contains(e.target as Node)) setOpenSub(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openSub, mobileOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const ctaLink = cta ? resolveLink(cta.link) : null;

  return (
    <>
      <nav ref={navRef} aria-label="Menu chính" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {items.map((item, i) => {
            const { href } = resolveLink(item.link);
            const current = isCurrent(pathname, item.link);
            const hasChildren = item.children.length > 0;
            const subId = `menu-con-${i}`;
            return (
              <li key={`${item.label}-${i}`} className="group relative flex items-center">
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-semibold hover:text-brand-ink ${current ? "text-brand-ink" : "text-ink"}`}
                >
                  {item.label}
                </Link>
                {hasChildren && (
                  <>
                    <button
                      ref={(el) => {
                        subButtons.current[i] = el;
                      }}
                      type="button"
                      aria-expanded={openSub === i}
                      aria-controls={subId}
                      aria-label={`Mở menu con ${item.label}`}
                      onClick={() => setOpenSub(openSub === i ? null : i)}
                      className="-ml-2 inline-flex size-8 items-center justify-center rounded-md text-muted hover:text-brand-ink"
                    >
                      <ChevronDownIcon width={16} height={16} />
                    </button>
                    <ul
                      id={subId}
                      className={`absolute left-0 top-full min-w-56 rounded-md border border-line bg-surface p-2 shadow-md ${openSub === i ? "block" : "hidden"} [@media(hover:hover)]:group-hover:block`}
                    >
                      {item.children.map((child, j) => (
                        <li key={`${child.label}-${j}`}>
                          <Link
                            href={resolveLink(child.link).href}
                            className="block rounded-sm px-3 py-2 text-sm text-body hover:bg-brand-100 hover:text-brand-ink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-2 lg:ml-4">
        {cta && ctaLink && (
          <ButtonLink href={ctaLink.href} variant="primary" className="whitespace-nowrap">
            {cta.label}
          </ButtonLink>
        )}
        <button
          ref={mobileButton}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="menu-mobile"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center rounded-md border border-line text-ink lg:hidden"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        id="menu-mobile"
        className={`fixed inset-x-0 bottom-0 top-header z-40 overflow-y-auto overscroll-contain bg-surface lg:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        <nav aria-label="Menu mobile" className="px-gutter py-4">
          <ul className="divide-y divide-line">
            {items.map((item, i) => (
              <li key={`${item.label}-${i}`} className="py-2">
                <Link
                  href={resolveLink(item.link).href}
                  aria-current={isCurrent(pathname, item.link) ? "page" : undefined}
                  className="flex min-h-11 items-center text-lg font-semibold text-ink"
                >
                  {item.label}
                </Link>
                {item.children.length > 0 && (
                  <ul className="pb-1 pl-4">
                    {item.children.map((child, j) => (
                      <li key={`${child.label}-${j}`}>
                        <Link href={resolveLink(child.link).href} className="flex min-h-11 items-center text-base text-muted">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
