/**
 * Chuẩn hoá dữ liệu thô (Sanity có thể trả null / thiếu trường) thành kiểu chung NGAY tại cửa (KT-01).
 * GROQ (`lib/sanity/queries.ts`) chiếu dữ liệu Sanity về đúng hình dạng kiểu chung; ở đây chỉ làm sạch.
 * Trang và component không phải tự xử lý null.
 * Trả `null` khi tài liệu thiếu trường bắt buộc → cửa nội dung rơi về seed và ghi log.
 */
import type {
  AboutPage,
  Address,
  Application,
  Category,
  CmsLink,
  ContactPage,
  ContentMap,
  Faq,
  Feature,
  FooterContent,
  HeaderContent,
  HomePage,
  ImageRef,
  LeadForms,
  MessageFormBlock,
  NavItem,
  NewsPage,
  NotFoundPage,
  OpeningHours,
  PartnershipPage,
  Phone,
  Post,
  PostSummary,
  PrivacyPage,
  ProcessStep,
  ProductGroup,
  ProductsPage,
  QuotePage,
  RichText,
  SectionHeading,
  Seo,
  SiteSettings,
  SocialLink,
  SocialPlatform,
  SpecRow,
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

function dropUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

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
    const raw = str(o.path);
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
    // Đích productGroup / application trả "/san-pham#slug" → tách anchor; anchor chọn tay được ưu tiên.
    const [path, hash] = raw.split("#", 2) as [string, string | undefined];
    const anchor = str(o.anchor) ?? str(hash);
    return anchor ? { kind: "internal", path, anchor } : { kind: "internal", path };
  }
  if (o?.kind === "external") {
    const url = str(o.url);
    if (!url || !/^(https?:\/\/|tel:\+?\d+$)/i.test(url)) return undefined;
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

const PLATFORMS: SocialPlatform[] = ["facebook", "youtube", "tiktok"];

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
  return dropUndefined<Phone>({ number, e164: str(o?.e164), label: str(o?.label) });
}

/** Mã ngày trong Sanity (Mo…Su) → tên schema.org; tên schema.org giữ nguyên. */
const DAY_CODES: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};
const WEEK = Object.values(DAY_CODES);
const DAY_VI: Record<string, string> = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

const day = (v: unknown): string | undefined => {
  const s = str(v);
  if (!s) return undefined;
  return DAY_CODES[s] ?? (WEEK.includes(s) ? s : undefined);
};

/** Nhãn ngày tiếng Việt: dải liên tiếp ≥ 3 ngày → "Thứ 2 – Thứ 7"; còn lại nối bằng ", ". */
export function daysLabel(days: string[]): string {
  const idx = [...new Set(days.map((d) => WEEK.indexOf(d)).filter((i) => i >= 0))].sort((a, b) => a - b);
  const contiguous = idx.length >= 3 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (contiguous) return `${DAY_VI[WEEK[idx[0]]]} – ${DAY_VI[WEEK[idx[idx.length - 1]]]}`;
  return idx.map((i) => DAY_VI[WEEK[i]]).join(", ");
}

function hours(v: unknown): OpeningHours | undefined {
  const o = obj(v);
  const opens = str(o?.opens);
  const closes = str(o?.closes);
  const days = list(o?.days, day);
  if (!opens || !closes || days.length === 0) return undefined;
  return { label: str(o?.label) ?? daysLabel(days), days, opens, closes };
}

function address(v: unknown): Address | undefined {
  const o = obj(v);
  if (!o) return undefined;
  const g = obj(o.geo);
  const lat = num(g?.lat);
  const lng = num(g?.lng);
  return dropUndefined({
    display: str(o.display),
    street: str(o.street),
    locality: str(o.locality),
    region: str(o.region),
    postalCode: str(o.postalCode),
    country: str(o.country) ?? "VN",
    mapUrl: str(o.mapUrl),
    embedUrl: str(o.embedUrl),
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

/** Mặc định bật hết (initialValue trong schema). */
function floating(v: unknown): SiteSettings["floatingContact"] {
  const o = obj(v);
  const on = (x: unknown) => x !== false;
  return { enabled: on(o?.enabled), showCall: on(o?.showCall), showZalo: on(o?.showZalo), showFacebook: on(o?.showFacebook) };
}

function siteSettings(v: unknown): SiteSettings | null {
  const o = obj(v);
  const brandName = str(o?.brandName);
  if (!o || !brandName) return null;
  const z = obj(o.zalo);
  const zaloUrl = str(z?.url);
  const titleTemplate = str(o.titleTemplate);
  const gtmId = str(o.gtmId);
  return dropUndefined<SiteSettings>({
    brandName,
    legalName: str(o.legalName),
    slogan: str(o.slogan),
    description: str(o.description),
    schemaType: o.schemaType === "LocalBusiness" ? "LocalBusiness" : "Organization",
    logo: image(o.logo, brandName),
    logoHeader: image(o.logoHeader, brandName),
    defaultOgImage: image(o.defaultOgImage, brandName),
    titleTemplate: titleTemplate?.includes("%s") ? titleTemplate : undefined,
    address: address(o.address),
    phones: list(o.phones, phone),
    email: str(o.email),
    zalo: zaloUrl ? { url: zaloUrl, label: str(z?.label) ?? "Zalo" } : undefined,
    socials: list(o.socials, social),
    openingHours: list(o.openingHours, hours),
    hoursNote: str(o.hoursNote),
    floatingContact: floating(o.floatingContact),
    gtmId: gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) ? gtmId : undefined,
    taxId: str(o.taxId),
    foundingYear: num(o.foundingYear),
    registeredAddress: str(o.registeredAddress),
    areaServed: str(o.areaServed),
    quickFacts: quickFacts(o.quickFacts),
  });
}

function quickFacts(v: unknown): SiteSettings["quickFacts"] {
  const o = obj(v);
  const q = dropUndefined({ what: str(o?.what), forWhom: str(o?.forWhom) });
  return Object.keys(q).length ? q : undefined;
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
  return dropUndefined({
    intro: str(o.intro),
    columns,
    showContact: o.showContact !== false,
    legalLinks: list(o.legalLinks, navItem),
    copyright: str(o.copyright),
  });
}

function homePage(v: unknown): HomePage | null {
  const o = obj(v);
  const h = obj(o?.hero);
  const titleLines = list(h?.titleLines, str);
  if (!o || titleLines.length === 0) return null;
  const partner = obj(o.partnerSection);
  const latest = obj(o.latestPosts);
  const count = num(latest?.count);
  return dropUndefined<HomePage>({
    seo: seo(o.seo),
    hero: dropUndefined({
      eyebrow: str(h?.eyebrow),
      titleLines,
      lead: str(h?.lead),
      cta: navItem(h?.cta),
      secondaryCta: navItem(h?.secondaryCta),
      image: image(h?.image),
    }),
    capability: headedFeatures(o.capability),
    productGroupsSection: headingOrUndefined(o.productGroupsSection),
    applicationsSection: headingOrUndefined(o.applicationsSection),
    partnerSection: partner ? dropUndefined({ heading: heading(partner.heading), cta: navItem(partner.cta) }) : undefined,
    latestPosts: {
      heading: heading(latest?.heading),
      count: count && Number.isInteger(count) && count >= 1 && count <= 6 ? count : 3,
    },
    messageForm: messageForm(o.messageForm),
  });
}

function notFoundPage(v: unknown): NotFoundPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  return dropUndefined({ title, body: str(o.body), links: list(o.links, navItem) });
}

function slugTitle(v: unknown): { slug: string; title: string } | undefined {
  const o = obj(v);
  const slug = str(o?.slug);
  const title = str(o?.title);
  return slug && title ? { slug, title } : undefined;
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
    category: slugTitle(o?.category),
    noindex: o?.noindex === true,
  });
}

const GRADES = ["thieu", "du", "khac"] as const;

function specRow(v: unknown): SpecRow | undefined {
  const o = obj(v);
  const label = str(o?.label);
  if (!label) return undefined;
  return dropUndefined<SpecRow>({
    label,
    nominal: str(o?.nominal),
    grade: GRADES.find((g) => g === o?.grade),
    actualThicknessMm: num(o?.actualThicknessMm),
    sizeMm: str(o?.sizeMm),
    sheetsPerBundle: str(o?.sheetsPerBundle),
    note: str(o?.note),
  });
}

function productGroup(v: unknown): ProductGroup | undefined {
  const o = obj(v);
  const slug = str(o?.slug);
  const title = str(o?.title);
  const nominalLabel = str(o?.nominalLabel);
  if (!slug || !title || !nominalLabel) return undefined;
  const r = obj(o?.actualRangeMm);
  const min = num(r?.min);
  const max = num(r?.max);
  return dropUndefined<ProductGroup>({
    slug,
    title,
    order: num(o?.order) ?? 0,
    nominalLabel,
    actualRangeMm: min !== undefined && max !== undefined && max >= min ? { min, max } : undefined,
    sheetsPerBundle: str(o?.sheetsPerBundle),
    description: str(o?.description),
    badge: str(o?.badge),
    image: image(o?.image, title),
    specs: list(o?.specs, specRow),
    quoteCtaLabel: str(o?.quoteCtaLabel),
  });
}

function application(v: unknown): Application | undefined {
  const o = obj(v);
  const slug = str(o?.slug);
  const title = str(o?.title);
  const thicknessHint = str(o?.thicknessHint);
  if (!slug || !title || !thicknessHint) return undefined;
  return dropUndefined<Application>({
    slug,
    title,
    order: num(o?.order) ?? 0,
    thicknessHint,
    recommendedGroups: list(o?.recommendedGroups, str),
    summary: str(o?.summary),
    cardImage: image(o?.cardImage, title),
    album: list(o?.album, (x) => {
      const img = image(x, title);
      const caption = str(obj(x)?.caption);
      return img && caption ? { ...img, caption } : img;
    }),
  });
}

function category(v: unknown): Category | undefined {
  const o = obj(v);
  const slug = str(o?.slug);
  const title = str(o?.title);
  if (!slug || !title) return undefined;
  return dropUndefined<Category>({ slug, title, order: num(o?.order) ?? 0, description: str(o?.description) });
}

const byOrder = <T extends { order: number }>(xs: T[]) => [...xs].sort((a, b) => a.order - b.order);

// ---------------- Khối dùng chung của trang ----------------

/** Portable Text: chỉ giữ phần tử có _type + _key; link không có href hợp lệ bị gỡ khỏi markDefs. */
export function richText(v: unknown): RichText {
  return list(v, (x) => {
    const o = obj(x);
    const type = str(o?._type);
    const key = str(o?._key);
    if (!o || !type || !key) return undefined;
    if (type === "block") {
      const markDefs = list(o.markDefs, (m) => {
        const mo = obj(m);
        if (!mo || !str(mo._key)) return undefined;
        if (mo._type === "link" && !safeHref(mo.href)) return undefined;
        return mo;
      });
      return { ...o, _type: type, _key: key, markDefs, children: Array.isArray(o.children) ? o.children : [] };
    }
    if (type === "figure") {
      const img = image(o);
      return img ? { _type: type, _key: key, ...img, caption: str(o.caption) } : undefined;
    }
    return { ...o, _type: type, _key: key };
  });
}

/** href an toàn cho link trong nội dung: path nội bộ, http(s), mailto:, tel:. */
export function safeHref(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^(https?:\/\/|mailto:|tel:)/i.test(s) ? s : undefined;
}

export function feature(v: unknown): Feature | undefined {
  const o = obj(v);
  const title = str(o?.title);
  // REQ-14 / CM-09: ý chờ khách xác nhận không bao giờ ra tới trang.
  if (!title || o?.verification === "needs_confirmation") return undefined;
  return dropUndefined<Feature>({ title, text: str(o?.text), icon: str(o?.icon), image: image(o?.image, title) });
}

function heading(v: unknown): SectionHeading {
  const o = obj(v);
  return dropUndefined({ eyebrow: str(o?.eyebrow), title: str(o?.title), intro: str(o?.intro) });
}

const headingOrUndefined = (v: unknown): SectionHeading | undefined => {
  const h = heading(v);
  return Object.keys(h).length ? h : undefined;
};

function faq(v: unknown): Faq | undefined {
  const o = obj(v);
  const items = list(o?.items, (x) => {
    const q = obj(x);
    const question = str(q?.question);
    const answer = richText(q?.answer);
    return question && answer.length ? { question, answer } : undefined;
  });
  return items.length ? dropUndefined<Faq>({ title: str(o?.title), items }) : undefined;
}

function step(v: unknown): ProcessStep | undefined {
  const o = obj(v);
  const title = str(o?.title);
  return title ? dropUndefined<ProcessStep>({ title, text: str(o?.text), image: image(o?.image, title) }) : undefined;
}

/** useDefault (mặc định true) → không mang tiêu đề riêng; template lấy câu mặc định ở leadForms. */
function messageForm(v: unknown): MessageFormBlock {
  const o = obj(v);
  if (!o || o.useDefault !== false) return {};
  return dropUndefined({ heading: str(o.heading), subheading: str(o.subheading) });
}

function headedFeatures(v: unknown): { heading: SectionHeading; items: Feature[] } | undefined {
  const o = obj(v);
  if (!o) return undefined;
  const items = list(o.items, feature);
  return items.length ? { heading: heading(o.heading), items } : undefined;
}

function productsPage(v: unknown): ProductsPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  const spec = obj(o.specTableSection);
  const cbu = obj(o.chooseByUse);
  const rows = list(cbu?.rows, (x) => {
    const r = obj(x);
    const use = str(r?.use);
    const thickness = str(r?.thickness);
    return use && thickness ? dropUndefined({ use, thickness, note: str(r?.note) }) : undefined;
  });
  return dropUndefined<ProductsPage>({
    seo: seo(o.seo),
    title,
    intro: str(o.intro),
    heroImage: image(o.heroImage, title),
    groupsSection: headingOrUndefined(o.groupsSection),
    specTableSection: spec ? dropUndefined({ heading: heading(spec.heading), footnote: str(spec.footnote) }) : undefined,
    applicationsSection: headingOrUndefined(o.applicationsSection),
    whyChoose: headedFeatures(o.whyChoose),
    chooseByUse: rows.length ? { heading: heading(cbu?.heading), rows } : undefined,
    faq: faq(o.faq),
    messageForm: messageForm(o.messageForm),
  });
}

function quotePage(v: unknown): QuotePage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  return dropUndefined<QuotePage>({ seo: seo(o.seo), title, intro: str(o.intro), benefits: list(o.benefits, feature), faq: faq(o.faq) });
}

function aboutPage(v: unknown): AboutPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  const story = obj(o.story);
  const storyBody = richText(story?.body);
  const factory = obj(o.factory);
  return dropUndefined<AboutPage>({
    seo: seo(o.seo),
    title,
    intro: str(o.intro),
    heroImage: image(o.heroImage, title),
    story: storyBody.length
      ? dropUndefined({ heading: heading(story?.heading), body: storyBody, image: image(story?.image) })
      : undefined,
    mission: str(o.mission),
    vision: str(o.vision),
    values: list(o.values, str),
    capability: headedFeatures(o.capability),
    factory: factory
      ? dropUndefined({
          heading: heading(factory.heading),
          processSteps: list(factory.processSteps, step),
          gallery: list(factory.gallery, (x) => image(x)),
          visitCta: navItem(factory.visitCta),
        })
      : undefined,
    messageForm: messageForm(o.messageForm),
  });
}

function partnershipPage(v: unknown): PartnershipPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  const g = obj(o.growTogether);
  const gTitle = str(g?.title);
  return dropUndefined<PartnershipPage>({
    seo: seo(o.seo),
    title,
    intro: str(o.intro),
    heroImage: image(o.heroImage, title),
    partnerGroups: headedFeatures(o.partnerGroups),
    growTogether:
      g && gTitle
        ? dropUndefined({
            eyebrow: str(g.eyebrow),
            title: gTitle,
            intro: str(g.intro),
            benefits: list(g.benefits, feature),
            logisticsImage: image(g.logisticsImage),
          })
        : undefined,
    processSteps: list(o.processSteps, step),
    registerCta: navItem(o.registerCta),
    faq: faq(o.faq),
  });
}

/** OQ-CM-04: số bài mỗi trang 6–24; thiếu / sai → 9. */
export const DEFAULT_POSTS_PER_PAGE = 9;

function newsPage(v: unknown): NewsPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  const per = num(o.postsPerPage);
  const c = obj(o.articleCta);
  const cHeading = str(c?.heading);
  return dropUndefined<NewsPage>({
    seo: seo(o.seo),
    title,
    intro: str(o.intro),
    postsPerPage: per && Number.isInteger(per) && per >= 6 && per <= 24 ? per : DEFAULT_POSTS_PER_PAGE,
    emptyText: str(o.emptyText),
    articleCta: c && cHeading ? dropUndefined({ heading: cHeading, text: str(c.text), cta: navItem(c.cta) }) : undefined,
  });
}

function contactPage(v: unknown): ContactPage | null {
  const o = obj(v);
  const title = str(o?.title);
  if (!o || !title) return null;
  return dropUndefined<ContactPage>({
    seo: seo(o.seo),
    title,
    intro: str(o.intro),
    showMap: o.showMap !== false,
    messageForm: messageForm(o.messageForm),
  });
}

/** Chưa publish / thiếu thân bài / thiếu ngày → null: route 404 và không vào sitemap (REQ-21). */
function privacyPage(v: unknown): PrivacyPage | null {
  const o = obj(v);
  const title = str(o?.title);
  const body = richText(o?.body);
  const updatedAt = str(o?.updatedAt);
  if (!o || !title || !body.length || !updatedAt) return null;
  return { seo: seo(o.seo), title, body, updatedAt };
}

function leadForms(v: unknown): LeadForms | null {
  const o = obj(v);
  const d = obj(o?.messageFormDefault);
  const c = obj(o?.contact);
  const q = obj(o?.quote);
  const pa = obj(o?.partnership);
  const dHeading = str(d?.heading);
  const successMessage = str(o?.successMessage);
  const errorMessage = str(o?.errorMessage);
  const roleOptions = list(c?.roleOptions, str);
  const needOptions = list(c?.needOptions, str);
  const cSubmit = str(c?.submitLabel);
  const qSubmit = str(q?.submitLabel);
  const pSubmit = str(pa?.submitLabel);
  if (!o || !dHeading || !successMessage || !errorMessage || !roleOptions.length || !needOptions.length || !cSubmit || !qSubmit || !pSubmit)
    return null;
  const note = richText(o.privacyNote);
  return dropUndefined<LeadForms>({
    messageFormDefault: dropUndefined({ heading: dHeading, subheading: str(d?.subheading) }),
    contact: dropUndefined({ roleOptions, needOptions, notePlaceholder: str(c?.notePlaceholder), submitLabel: cSubmit }),
    quote: dropUndefined({ heading: str(q?.heading), notePlaceholder: str(q?.notePlaceholder), submitLabel: qSubmit }),
    partnership: dropUndefined({ heading: str(pa?.heading), intro: str(pa?.intro), submitLabel: pSubmit }),
    successMessage,
    errorMessage,
    privacyNote: note.length ? note : undefined,
  });
}

/** Bài đầy đủ; null khi thiếu slug / tiêu đề / thân bài. */
export function postDetail(v: unknown): Post | null {
  const summary = post(v);
  const o = obj(v);
  const body = richText(o?.body);
  if (!summary || !body.length) return null;
  return dropUndefined<Post>({
    ...summary,
    seoTitle: str(o?.seoTitle),
    seoDescription: str(o?.seoDescription),
    ogImage: image(o?.ogImage),
    body,
    relatedSlugs: list(o?.relatedSlugs, str),
  });
}

export const NORMALIZERS: { [K in keyof ContentMap]: (raw: unknown) => ContentMap[K] | null } = {
  siteSettings,
  header,
  footer,
  homePage,
  productsPage,
  quotePage,
  aboutPage,
  partnershipPage,
  newsPage,
  contactPage,
  privacyPage,
  leadForms,
  notFoundPage,
  posts: (raw) => list(raw, post),
  productGroups: (raw) => byOrder(list(raw, productGroup)),
  applications: (raw) => byOrder(list(raw, application)),
  categories: (raw) => byOrder(list(raw, category)),
};
