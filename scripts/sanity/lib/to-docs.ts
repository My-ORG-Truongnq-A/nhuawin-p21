/**
 * Seed (ContentMap, hình dạng "đọc") → tài liệu Sanity (hình dạng "lưu").
 * Đảo ngược đúng phép chiếu GROQ ở `lib/sanity/queries.ts`. Thuần, tất định, không gọi mạng.
 * Không bịa: trường seed không có thì không ghi (chỉ áp mặc định đã ghi trong content_model / schema).
 */
import { PAGE_PATHS, SLUG_PATHS } from "../../../lib/content/doc-paths";
import type {
  CmsLink,
  ContentMap,
  Faq,
  Feature,
  FooterContent,
  HeaderContent,
  ImageRef,
  NavItem,
  Post,
  ProcessStep,
  RichText,
  SectionHeading,
  Seo,
} from "../../../lib/content/types";
import { LINK_ANCHORS } from "../../../sanity/schemaTypes/objects/link";
import type { AssetInfo } from "./assets";

export type SanityDoc = { _id: string; _type: string } & Record<string, unknown>;
type Obj = Record<string, unknown>;

export type BuildCtx = {
  assets: Map<string, AssetInfo>;
  /** Thời điểm crawl web cũ (ISO). */
  crawledAt: string;
  legacySite: string;
};

const PAGE_BY_PATH = new Map<string, string>(Object.entries(PAGE_PATHS).map(([t, p]) => [p, t]));

/**
 * `_id` dùng dấu '-' chứ không '.': Sanity coi `_id` có dấu chấm là tài liệu riêng tư,
 * không đọc được qua CDN công khai — site đọc qua CDN.
 */
export const docId = {
  post: (slug: string) => `post-${slug}`,
  category: (slug: string) => `category-${slug}`,
  productGroup: (slug: string) => `productGroup-${slug}`,
  application: (slug: string) => `application-${slug}`,
};

/** Bỏ undefined / chuỗi rỗng / object rỗng — Studio không cần khoá trống. */
export function clean<T>(v: T): T {
  if (Array.isArray(v)) return v.map(clean).filter((x) => x !== undefined) as T;
  if (v && typeof v === "object") {
    const out: Obj = {};
    for (const [k, x] of Object.entries(v as Obj)) {
      const c = clean(x);
      if (c === undefined || c === "" || (c && typeof c === "object" && !Array.isArray(c) && Object.keys(c).length === 0)) continue;
      out[k] = c;
    }
    return out as T;
  }
  return v;
}

export class Builder {
  private n = 0;
  constructor(
    private ctx: BuildCtx,
    private docKey: string,
  ) {}

  key = () => `${this.docKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}${(++this.n).toString(36)}`;

  figure(img: (ImageRef & { caption?: string }) | undefined, keyed = false): Obj | undefined {
    if (!img) return undefined;
    const a = this.ctx.assets.get(img.url);
    if (!a) throw new Error(`Thiếu asset cho ảnh ${img.url}`);
    return clean({
      _type: "figure",
      ...(keyed ? { _key: this.key() } : {}),
      asset: { _type: "reference", _ref: a.assetId },
      alt: img.alt,
      caption: img.caption,
      source: "legacy_site",
    });
  }

  /** Đích nội bộ theo path → reference dựng từ bảng doc-paths. */
  ref(path: string): { _type: "reference"; _ref: string } {
    const page = PAGE_BY_PATH.get(path);
    if (page) return { _type: "reference", _ref: page };
    const post = path.match(/^\/tin-tuc\/([a-z0-9-]+)$/);
    if (post) return { _type: "reference", _ref: docId.post(post[1]) };
    throw new Error(`Không có tài liệu đích cho đường dẫn nội bộ ${path}`);
  }

  link(label: string, l: CmsLink, keyed = false): Obj {
    const base = { _type: "link", ...(keyed ? { _key: this.key() } : {}), label };
    if (l.kind === "internal") {
      if (l.anchor && !(LINK_ANCHORS as readonly string[]).includes(l.anchor)) throw new Error(`Anchor ngoài danh sách cho phép: ${l.anchor}`);
      return clean({ ...base, kind: "internal", internal: this.ref(l.path), anchor: l.anchor, newTab: false });
    }
    if (l.url.startsWith("tel:")) return { ...base, kind: "phone" };
    if (!l.url.startsWith("https://")) throw new Error(`URL ngoài phải là https: ${l.url}`);
    return clean({ ...base, kind: "external", external: l.url, newTab: true });
  }

  linkOf(n: NavItem | undefined, keyed = false): Obj | undefined {
    return n ? this.link(n.label, n.link, keyed) : undefined;
  }

  heading(h: SectionHeading | undefined): Obj | undefined {
    return h && Object.keys(h).length ? { _type: "sectionHeading", ...h } : undefined;
  }

  seo(s: Seo | undefined): Obj | undefined {
    if (!s) return undefined;
    return clean({ _type: "seo", title: s.title, description: s.description, noindex: s.noindex ?? false, ogImage: this.figure(s.ogImage) });
  }

  feature(f: Feature): Obj {
    return clean({
      _type: "featureItem",
      _key: this.key(),
      title: f.title,
      text: f.text,
      icon: f.icon,
      image: this.figure(f.image),
      verification: "confirmed",
    });
  }

  headed(h: { heading: SectionHeading; items: Feature[] } | undefined): Obj | undefined {
    return h ? clean({ heading: this.heading(h.heading), items: h.items.map((f) => this.feature(f)) }) : undefined;
  }

  step(s: ProcessStep): Obj {
    return clean({ _type: "processStep", _key: this.key(), title: s.title, text: s.text, image: this.figure(s.image) });
  }

  /** Portable Text: giữ khoá của seed, đổi figure sang asset, link nội bộ sang reference. */
  rich(rt: RichText | undefined): Obj[] | undefined {
    if (!rt?.length) return undefined;
    return rt.map((b) => {
      if (b._type === "figure") {
        return { ...this.figure(b as unknown as ImageRef & { caption?: string })!, _key: b._key };
      }
      if (b._type === "block") {
        const markDefs = ((b.markDefs as Obj[] | undefined) ?? []).map((m) => {
          if (m._type !== "link") return m;
          const href = String(m.href ?? "");
          if (href.startsWith("/")) {
            const [path] = href.split("#");
            return { _type: "link", _key: m._key, kind: "internal", internal: this.ref(path), newTab: false, nofollow: false };
          }
          return {
            _type: "link",
            _key: m._key,
            kind: "external",
            href,
            newTab: !href.startsWith("mailto:") && !href.startsWith("tel:"),
            nofollow: false,
          };
        });
        return { ...b, markDefs } as Obj;
      }
      return { ...b } as Obj; // table / embed / faq: giữ nguyên
    });
  }

  faq(f: Faq | undefined): Obj | undefined {
    if (!f) return undefined;
    return clean({
      _type: "faq",
      title: f.title,
      items: f.items.map((i) => ({ _type: "faqItem", _key: this.key(), question: i.question, answer: this.rich(i.answer) })),
    });
  }

  messageForm(m: { heading?: string; subheading?: string } | undefined): Obj {
    return m && (m.heading || m.subheading)
      ? clean({ _type: "messageFormBlock", useDefault: false, heading: m.heading, subheading: m.subheading })
      : { _type: "messageFormBlock", useDefault: true };
  }
}

const DAY_CODE: Record<string, string> = {
  Monday: "Mo",
  Tuesday: "Tu",
  Wednesday: "We",
  Thursday: "Th",
  Friday: "Fr",
  Saturday: "Sa",
  Sunday: "Su",
};

/** Ngày YYYY-MM-DD → datetime giờ Việt Nam (tất định, không phụ thuộc múi giờ máy chạy). */
const vnDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00+07:00` : d);

export function buildDocs(seed: ContentMap, posts: Post[], ctx: BuildCtx): SanityDoc[] {
  const docs: SanityDoc[] = [];
  const legacy = (path: string) => ({
    _type: "legacyId",
    url: new URL(path, ctx.legacySite).toString(),
    path,
    crawledAt: ctx.crawledAt,
  });
  const push = (_id: string, _type: string, body: Obj) => docs.push({ _id, _type, ...(clean(body) as Obj) });

  // ---- siteSettings ----
  {
    const b = new Builder(ctx, "siteSettings");
    const s = seed.siteSettings;
    const [streetAddress, ...wardParts] = (s.address?.street ?? "").split(", ");
    push("siteSettings", "siteSettings", {
      siteName: s.brandName,
      legalName: s.legalName,
      tagline: s.slogan,
      areaServed: s.areaServed,
      quickFacts: s.quickFacts,
      logoFull: b.figure(s.logo),
      logoHeader: b.figure(s.logoHeader),
      // OQ-CM-07: nhãn / số chính chờ khách; tạm số đầu tiên (trùng số Zalo) là số chính.
      phones: s.phones.map((p, i) => ({
        _type: "phone",
        _key: b.key(),
        display: p.number,
        e164: p.e164,
        label: p.label,
        isPrimary: i === 0,
      })),
      email: s.email,
      address: s.address && {
        display: s.address.display,
        streetAddress: streetAddress || undefined,
        ward: wardParts.join(", ") || undefined,
        city: s.address.locality,
        postalCode: s.address.postalCode,
        country: s.address.country,
      },
      googleMapsUrl: s.address?.mapUrl,
      mapEmbedUrl: s.address?.embedUrl,
      geo: s.address?.geo && { _type: "geopoint", lat: s.address.geo.lat, lng: s.address.geo.lng },
      openingHours: s.openingHours.map((h) => ({
        _type: "openingHoursRow",
        _key: b.key(),
        days: h.days.map((d) => DAY_CODE[d] ?? d),
        opens: h.opens,
        closes: h.closes,
      })),
      hoursNote: s.hoursNote,
      socialLinks: [
        ...(s.zalo ? [{ _type: "socialLink", _key: b.key(), platform: "zalo", url: s.zalo.url, label: s.zalo.label, confirmed: false }] : []),
        ...s.socials.map((x) => ({ _type: "socialLink", _key: b.key(), platform: x.platform, url: x.url, label: x.label, confirmed: x.confirmed })),
      ],
      floatingContact: s.floatingContact,
      legal: { taxId: s.taxId, registeredAddress: s.registeredAddress, foundedYear: s.foundingYear },
      seoDefaults: { titleTemplate: s.titleTemplate, defaultDescription: s.description, defaultOgImage: b.figure(s.defaultOgImage) },
      gtmId: s.gtmId,
    });
  }

  // ---- header / footer ----
  {
    const b = new Builder(ctx, "header");
    const h: HeaderContent = seed.header;
    push("header", "header", {
      items: h.items.map((i) => ({
        _type: "navItem",
        _key: b.key(),
        link: b.link(i.label, i.link),
        children: i.children.map((c) => b.link(c.label, c.link, true)),
      })),
      cta: b.linkOf(h.cta),
    });
  }
  {
    const b = new Builder(ctx, "footer");
    const f: FooterContent = seed.footer;
    push("footer", "footer", {
      intro: f.intro,
      columns: f.columns.map((c) => ({ _type: "footerColumn", _key: b.key(), title: c.title, links: c.items.map((i) => b.linkOf(i, true)) })),
      showContact: f.showContact,
      legalLinks: f.legalLinks.map((i) => b.linkOf(i, true)),
      copyright: f.copyright,
    });
  }

  // ---- leadForms / notFound / redirectSettings ----
  {
    const b = new Builder(ctx, "leadForms");
    const l = seed.leadForms;
    push("leadForms", "leadForms", {
      messageFormDefault: l.messageFormDefault,
      contact: l.contact,
      quote: l.quote,
      partnership: l.partnership,
      successMessage: l.successMessage,
      errorMessage: l.errorMessage,
      privacyNote: b.rich(l.privacyNote),
    });
  }
  {
    const b = new Builder(ctx, "notFoundPage");
    const n = seed.notFoundPage;
    push("notFoundPage", "notFoundPage", { title: n.title, text: n.body, links: n.links.map((i) => b.linkOf(i, true)) });
  }
  // legacy_url_map giữ nguyên slug → chưa có luật chuyển hướng nào cần seed; khách thêm trong Studio.
  docs.push({ _id: "redirectSettings", _type: "redirectSettings", rules: [] });

  // ---- trang singleton ----
  {
    const b = new Builder(ctx, "homePage");
    const p = seed.homePage;
    push("homePage", "homePage", {
      seo: b.seo(p.seo),
      hero: {
        eyebrow: p.hero.eyebrow,
        headlineLines: p.hero.titleLines,
        subheadline: p.hero.lead,
        image: b.figure(p.hero.image),
        primaryCta: b.linkOf(p.hero.cta),
        secondaryCta: b.linkOf(p.hero.secondaryCta),
      },
      capability: b.headed(p.capability),
      productGroupsSection: b.heading(p.productGroupsSection),
      applicationsSection: b.heading(p.applicationsSection),
      partnerSection: p.partnerSection && { heading: b.heading(p.partnerSection.heading), cta: b.linkOf(p.partnerSection.cta) },
      latestPosts: p.latestPosts && { heading: b.heading(p.latestPosts.heading), count: p.latestPosts.count },
      messageForm: b.messageForm(p.messageForm),
      legacy: legacy("/"),
    });
  }
  {
    const b = new Builder(ctx, "productsPage");
    const p = seed.productsPage;
    push("productsPage", "productsPage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      heroImage: b.figure(p.heroImage),
      groupsSection: b.heading(p.groupsSection),
      specTableSection: p.specTableSection && { heading: b.heading(p.specTableSection.heading), footnote: p.specTableSection.footnote },
      applicationsSection: b.heading(p.applicationsSection),
      whyChoose: b.headed(p.whyChoose),
      chooseByUseSection: b.heading(p.chooseByUse?.heading),
      chooseByUseRows: p.chooseByUse?.rows.map((r) => ({ _type: "useRow", _key: b.key(), ...r })),
      faq: b.faq(p.faq),
      messageForm: b.messageForm(p.messageForm),
      legacy: legacy("/san-pham"),
    });
  }
  {
    const b = new Builder(ctx, "quotePage");
    const p = seed.quotePage;
    push("quotePage", "quotePage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      benefits: p.benefits.map((f) => b.feature(f)),
      faq: b.faq(p.faq),
      legacy: legacy("/bao-gia"),
    });
  }
  {
    const b = new Builder(ctx, "aboutPage");
    const p = seed.aboutPage;
    push("aboutPage", "aboutPage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      heroImage: b.figure(p.heroImage),
      storyHeading: b.heading(p.story?.heading),
      story: b.rich(p.story?.body),
      storyImage: b.figure(p.story?.image),
      mission: p.mission,
      vision: p.vision,
      values: p.values,
      capability: b.headed(p.capability),
      factory: p.factory && {
        heading: b.heading(p.factory.heading),
        processSteps: p.factory.processSteps.map((s) => b.step(s)),
        gallery: p.factory.gallery.map((g) => b.figure(g, true)),
        visitCta: b.linkOf(p.factory.visitCta),
      },
      messageForm: b.messageForm(p.messageForm),
      legacy: legacy("/ve-win"),
    });
  }
  {
    const b = new Builder(ctx, "partnershipPage");
    const p = seed.partnershipPage;
    push("partnershipPage", "partnershipPage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      heroImage: b.figure(p.heroImage),
      partnerGroups: b.headed(p.partnerGroups),
      growTogether: p.growTogether && {
        eyebrow: p.growTogether.eyebrow,
        title: p.growTogether.title,
        intro: p.growTogether.intro,
        benefits: p.growTogether.benefits.map((f) => b.feature(f)),
        logisticsImage: b.figure(p.growTogether.logisticsImage),
      },
      processSteps: p.processSteps.map((s) => b.step(s)),
      registerCta: b.linkOf(p.registerCta),
      faq: b.faq(p.faq),
      legacy: legacy("/hop-tac"),
    });
  }
  {
    const b = new Builder(ctx, "newsPage");
    const p = seed.newsPage;
    push("newsPage", "newsPage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      postsPerPage: p.postsPerPage,
      emptyText: p.emptyText,
      articleCta: p.articleCta && { heading: p.articleCta.heading, text: p.articleCta.text, cta: b.linkOf(p.articleCta.cta) },
      legacy: legacy("/tin-tuc"),
    });
  }
  {
    const b = new Builder(ctx, "contactPage");
    const p = seed.contactPage;
    push("contactPage", "contactPage", {
      seo: b.seo(p.seo),
      title: p.title,
      intro: p.intro,
      showMap: p.showMap,
      messageForm: b.messageForm(p.messageForm),
      legacy: legacy("/lien-he"),
    });
  }
  // privacyPage: chưa có nội dung được duyệt (MI-15) → KHÔNG tạo tài liệu (route 404, không vào sitemap).
  if (seed.privacyPage) {
    const b = new Builder(ctx, "privacyPage");
    const p = seed.privacyPage;
    push("privacyPage", "privacyPage", { seo: b.seo(p.seo), title: p.title, body: b.rich(p.body), updatedAt: p.updatedAt });
  }

  // ---- tài liệu nhiều bản ghi ----
  for (const c of seed.categories) {
    push(docId.category(c.slug), "category", {
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      description: c.description,
      order: c.order,
      legacy: legacy(SLUG_PATHS.category.replace("{slug}", c.slug)),
    });
  }
  for (const g of seed.productGroups) {
    const b = new Builder(ctx, `pg${g.slug}`);
    push(docId.productGroup(g.slug), "productGroup", {
      title: g.title,
      slug: { _type: "slug", current: g.slug },
      order: g.order,
      nominalLabel: g.nominalLabel,
      actualRangeMm: g.actualRangeMm,
      sheetsPerBundle: g.sheetsPerBundle,
      description: g.description,
      badge: g.badge,
      image: b.figure(g.image),
      specs: g.specs.map((r) => ({ _type: "specRow", _key: b.key(), ...r })),
      quoteCtaLabel: g.quoteCtaLabel,
    });
  }
  for (const a of seed.applications) {
    const b = new Builder(ctx, `ap${a.slug}`);
    push(docId.application(a.slug), "application", {
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      order: a.order,
      thicknessHint: a.thicknessHint,
      recommendedGroups: a.recommendedGroups.map((s) => ({ _type: "reference", _key: b.key(), _ref: docId.productGroup(s) })),
      summary: a.summary,
      // Web cũ chỉ có ảnh thẻ cho 3/7 ứng dụng; ứng dụng còn lại dùng ảnh đầu album (cùng ứng dụng) — ghi ở báo cáo.
      cardImage: b.figure(a.cardImage ?? a.album[0]),
      album: a.album.map((x) => b.figure(x, true)),
    });
  }
  for (const p of posts) {
    const b = new Builder(ctx, `po${p.slug}`);
    if (!p.category) throw new Error(`Bài ${p.slug} thiếu chủ đề`);
    push(docId.post(p.slug), "post", {
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      publishedAt: p.publishedAt ? vnDate(p.publishedAt) : undefined,
      updatedAt: p.updatedAt ? vnDate(p.updatedAt) : undefined,
      category: { _type: "reference", _ref: docId.category(p.category.slug) },
      excerpt: p.excerpt,
      mainImage: b.figure(p.image),
      body: b.rich(p.body),
      relatedPosts: p.relatedSlugs.map((s) => ({ _type: "reference", _key: b.key(), _ref: docId.post(s) })),
      seo: b.seo({ title: p.seoTitle, description: p.seoDescription, noindex: p.noindex, ogImage: p.ogImage }),
      legacy: legacy(`/tin-tuc/${p.slug}`),
    });
  }
  return docs;
}
