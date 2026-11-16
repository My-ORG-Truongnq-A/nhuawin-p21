/**
 * Chuẩn hoá dữ liệu thô (Sanity có thể trả null / thiếu trường) thành kiểu chung NGAY tại cửa (KT-01).
 * Trang và component không phải tự xử lý null.
 * Trả `null` khi tài liệu thiếu trường bắt buộc → cửa nội dung rơi về seed và ghi log.
 */
import type {
  Address,
  CmsLink,
  ContentMap,
  FooterContent,
  HeaderContent,
  HomePage,
  ImageRef,
  NavItem,
  NotFoundPage,
  OpeningHours,
  Phone,
  PostSummary,
  Seo,
  SiteSettings,
  SocialLink,
  SocialPlatform,
} from "./types";

type Raw = Record<string, unknown>;

const obj = (v: unknown): Raw | null =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : null;

const str = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
};

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

const list = <T>(v: unknown, map: (x: unknown) => T | null | undefined): T[] =>
  Array.isArray(v) ? v.map(map).filter((x): x is T => x !== null && x !== undefined) : [];

export function image(v: unknown, fallbackAlt = ""): ImageRef | undefined {
  const o = obj(v);
  const url = str(o?.url);
  const width = num(o?.width);
  const height = num(o?.height);
  if (!url || !width || !height) return undefined;
  return { url, width, height, alt: str(o?.alt) ?? fallbackAlt };
}

export function link(v: unknown): CmsLink | undefined {
  const o = obj(v);
  if (o?.kind === "internal") {
    const path = str(o.path);
    if (!path || !path.startsWith("/")) return undefined;
    const anchor = str(o.anchor);
    return anchor ? { kind: "internal", path, anchor } : { kind: "internal", path };
  }
  if (o?.kind === "external") {
    const url = str(o.url);
    if (!url || !/^https?:\/\//i.test(url)) return undefined;
    return { kind: "external", url };
  }
  return undefined;
}

export function navItem(v: unknown): NavItem | undefined {
  const o = obj(v);
  const label = str(o?.label);
  const l = link(o?.link);
  if (!label || !l) return undefined;
  return { label, link: l, children: list(o?.children, navItem) };
}

const PLATFORMS: SocialPlatform[] = ["facebook", "youtube", "tiktok", "linkedin", "google_business"];

function social(v: unknown): SocialLink | undefined {
  const o = obj(v);
  const platform = PLATFORMS.find((p) => p === o?.platform);
  const url = str(o?.url);
  if (!platform || !url || !/^https?:\/\//i.test(url)) return undefined;
  return { platform, url, label: str(o?.label) ?? platform, confirmed: o?.confirmed === true };
}

function phone(v: unknown): Phone | undefined {
  const o = obj(v);
  const number = str(o?.number);
  if (!number) return undefined;
  const label = str(o?.label);
  return label ? { number, label } : { number };
}

function hours(v: unknown): OpeningHours | undefined {
  const o = obj(v);
  const label = str(o?.label);
  const opens = str(o?.opens);
  const closes = str(o?.closes);
  const days = list(o?.days, str);
  if (!label || !opens || !closes || days.length === 0) return undefined;
  return { label, days, opens, closes };
}

function address(v: unknown): Address | undefined {
  const o = obj(v);
  if (!o) return undefined;
  const g = obj(o.geo);
  const lat = num(g?.lat);
  const lng = num(g?.lng);
  return dropUndefined({
    street: str(o.street),
    locality: str(o.locality),
    region: str(o.region),
    postalCode: str(o.postalCode),
    country: str(o.country) ?? "VN",
    mapUrl: str(o.mapUrl),
    geo: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  });
}

function seo(v: unknown): Seo {
  const o = obj(v);
  return dropUndefined({
    title: str(o?.title),
    description: str(o?.description),
    noindex: o?.noindex === true,
    ogImage: image(o?.ogImage),
  });
}

function dropUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

function siteSettings(v: unknown): SiteSettings | null {
  const o = obj(v);
  const brandName = str(o?.brandName);
  if (!o || !brandName) return null;
  const z = obj(o.zalo);
  const zaloUrl = str(z?.url);
  return dropUndefined<SiteSettings>({
    brandName,
    legalName: str(o.legalName),
    slogan: str(o.slogan),
    description: str(o.description),
    schemaType: o.schemaType === "LocalBusiness" ? "LocalBusiness" : "Organization",
    logo: image(o.logo, brandName),
    defaultOgImage: image(o.defaultOgImage, brandName),
    address: address(o.address),
    phones: list(o.phones, phone),
    email: str(o.email),
    zalo: zaloUrl ? { url: zaloUrl, label: str(z?.label) ?? "Zalo" } : undefined,
    socials: list(o.socials, social),
    openingHours: list(o.openingHours, hours),
    taxId: str(o.taxId),
    foundingYear: num(o.foundingYear),
    areaServed: str(o.areaServed),
  });
}

function header(v: unknown): HeaderContent | null {
  const o = obj(v);
  if (!o) return null;
  return dropUndefined({ items: list(o.items, navItem), cta: navItem(o.cta) });
}

function footer(v: unknown): FooterContent | null {
  const o = obj(v);
  if (!o) return null;
  const columns = list(o.columns, (c) => {
    const co = obj(c);
    const title = str(co?.title);
    return title ? { title, items: list(co?.items, navItem) } : undefined;
  });
  return dropUndefined({ columns, privacyLink: navItem(o.privacyLink) });
}

function homePage(v: unknown): HomePage | null {
  const o = obj(v);
  const h = obj(o?.hero);
  const titleLines = list(h?.titleLines, str);
  if (!o || titleLines.length === 0) return null;
  return {
    seo: seo(o.seo),
    hero: dropUndefined({
      eyebrow: str(h?.eyebrow),
      titleLines,
      lead: str(h?.lead),
      cta: navItem(h?.cta),
      image: image(h?.image),
    }),
  };
}

function notFoundPage(v: unknown): NotFoundPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  return dropUndefined({ title, body: str(o.body), links: list(o.links, navItem) });
}

function post(v: unknown): PostSummary | undefined {
  const o = obj(v);
  const slug = str(o?.slug);
  const title = str(o?.title);
  if (!slug || !title) return undefined;
  return dropUndefined({
    slug,
    title,
    excerpt: str(o?.excerpt),
    publishedAt: str(o?.publishedAt),
    updatedAt: str(o?.updatedAt),
    image: image(o?.image, title),
    noindex: o?.noindex === true,
  });
}

export const NORMALIZERS: { [K in keyof ContentMap]: (raw: unknown) => ContentMap[K] | null } = {
  siteSettings,
  header,
  footer,
  homePage,
  notFoundPage,
  posts: (raw) => list(raw, post),
};
