/** Kiểu dữ liệu chung trả ra từ cửa nội dung (KT-01). Mọi trang / component chỉ dùng các kiểu này. */

export type ImageRef = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type CmsLink =
  | { kind: "internal"; path: string; anchor?: string }
  /** http(s) mở tab mới; `tel:` (link Gọi số chính) mở tại chỗ. */
  | { kind: "external"; url: string };

export type NavItem = {
  label: string;
  link: CmsLink;
  children: NavItem[];
};

/** `number` là số hiển thị; `e164` (vd +84900000000) dùng cho tel: / JSON-LD. Số đầu tiên là số chính. */
export type Phone = { number: string; e164?: string; label?: string };

export type SocialPlatform = "facebook" | "youtube" | "tiktok";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
  /** Chỉ hiện / đưa vào sameAs khi khách đã xác nhận (MI-16). */
  confirmed: boolean;
};

export type OpeningHours = {
  /** Nhãn hiển thị, vd "Thứ 2 – Thứ 7". */
  label: string;
  /** Mã ngày schema.org: Monday…Sunday. */
  days: string[];
  opens: string;
  closes: string;
};

export type Address = {
  /** Địa chỉ một dòng để hiển thị. */
  display?: string;
  street?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country: string;
  mapUrl?: string;
  /** Link nhúng iframe bản đồ (khác link rút gọn). */
  embedUrl?: string;
  geo?: { lat: number; lng: number };
};

export type SiteSettings = {
  brandName: string;
  legalName?: string;
  slogan?: string;
  description?: string;
  schemaType: "Organization" | "LocalBusiness";
  logo?: ImageRef;
  /** Logo rút gọn cho thanh menu; thiếu thì dùng `logo`. */
  logoHeader?: ImageRef;
  defaultOgImage?: ImageRef;
  /** Mẫu tiêu đề trang, chứa %s. */
  titleTemplate?: string;
  address?: Address;
  phones: Phone[];
  email?: string;
  zalo?: { url: string; label: string };
  socials: SocialLink[];
  openingHours: OpeningHours[];
  hoursNote?: string;
  floatingContact: { enabled: boolean; showCall: boolean; showZalo: boolean; showFacebook: boolean };
  gtmId?: string;
  taxId?: string;
  foundingYear?: number;
  registeredAddress?: string;
  areaServed?: string;
  /** Khối thông tin nhanh (REQ-27): dòng "Làm gì" / "Cho ai" sửa trong CMS. */
  quickFacts?: { what?: string; forWhom?: string };
};

export type Seo = {
  title?: string;
  description?: string;
  noindex: boolean;
  ogImage?: ImageRef;
};

export type HeaderContent = {
  items: NavItem[];
  cta?: NavItem;
};

export type FooterContent = {
  intro?: string;
  columns: { title: string; items: NavItem[] }[];
  showContact: boolean;
  /** Chỉ chứa link tới trang đã publish (vd Chính sách bảo mật — REQ-21). */
  legalLinks: NavItem[];
  /** Có thể chứa {year}, {legalName}. */
  copyright?: string;
};

/**
 * Portable Text đã chuẩn hoá: link trong markDefs mang `href` đã dựng sẵn (GROQ resolve reference).
 * Khối: block (normal/h2/h3/h4/blockquote, listItem), figure, table, embed, faq.
 */
export type RichText = ({ _type: string; _key: string } & Record<string, unknown>)[];

/** Ý nổi bật (featureItem). Ý `needs_confirmation` bị lọc ngay ở cửa (REQ-14, CM-09). */
export type Feature = { title: string; text?: string; icon?: string; image?: ImageRef };

export type SectionHeading = { eyebrow?: string; title?: string; intro?: string };

export type FaqItem = { question: string; answer: RichText };
export type Faq = { title?: string; items: FaqItem[] };

export type ProcessStep = { title: string; text?: string; image?: ImageRef };

/** Khối form tin nhắn trên trang: tiêu đề riêng hoặc dùng mặc định ở leadForms. */
export type MessageFormBlock = { heading?: string; subheading?: string };

export type HomePage = {
  seo: Seo;
  hero: {
    eyebrow?: string;
    titleLines: string[];
    lead?: string;
    cta?: NavItem;
    secondaryCta?: NavItem;
    image?: ImageRef;
  };
  capability?: { heading: SectionHeading; items: Feature[] };
  productGroupsSection?: SectionHeading;
  applicationsSection?: SectionHeading;
  partnerSection?: { heading: SectionHeading; cta?: NavItem };
  latestPosts?: { heading: SectionHeading; count: number };
  messageForm: MessageFormBlock;
};

export type ProductsPage = {
  seo: Seo;
  title: string;
  intro?: string;
  heroImage?: ImageRef;
  groupsSection?: SectionHeading;
  specTableSection?: { heading: SectionHeading; footnote?: string };
  applicationsSection?: SectionHeading;
  whyChoose?: { heading: SectionHeading; items: Feature[] };
  chooseByUse?: { heading: SectionHeading; rows: { use: string; thickness: string; note?: string }[] };
  faq?: Faq;
  messageForm: MessageFormBlock;
};

export type QuotePage = {
  seo: Seo;
  title: string;
  intro?: string;
  benefits: Feature[];
  faq?: Faq;
};

export type AboutPage = {
  seo: Seo;
  title: string;
  intro?: string;
  heroImage?: ImageRef;
  story?: { heading: SectionHeading; body: RichText; image?: ImageRef };
  mission?: string;
  vision?: string;
  values: string[];
  capability?: { heading: SectionHeading; items: Feature[] };
  factory?: { heading: SectionHeading; processSteps: ProcessStep[]; gallery: ImageRef[]; visitCta?: NavItem };
  messageForm: MessageFormBlock;
};

export type PartnershipPage = {
  seo: Seo;
  title: string;
  intro?: string;
  heroImage?: ImageRef;
  partnerGroups?: { heading: SectionHeading; items: Feature[] };
  growTogether?: { eyebrow?: string; title: string; intro?: string; benefits: Feature[]; logisticsImage?: ImageRef };
  processSteps: ProcessStep[];
  registerCta?: NavItem;
  faq?: Faq;
};

export type NewsPage = {
  seo: Seo;
  title: string;
  intro?: string;
  /** Số bài mỗi trang (OQ-CM-04). */
  postsPerPage: number;
  emptyText?: string;
  articleCta?: { heading: string; text?: string; cta?: NavItem };
};

export type ContactPage = {
  seo: Seo;
  title: string;
  intro?: string;
  showMap: boolean;
  messageForm: MessageFormBlock;
};

export type PrivacyPage = {
  seo: Seo;
  title: string;
  body: RichText;
  updatedAt: string;
};

/** Câu chữ 3 form (leadForms). Bộ trường + validate nằm trong code (lib/leads). */
export type LeadForms = {
  messageFormDefault: { heading: string; subheading?: string };
  contact: { roleOptions: string[]; needOptions: string[]; notePlaceholder?: string; submitLabel: string };
  quote: { heading?: string; notePlaceholder?: string; submitLabel: string };
  partnership: { heading?: string; intro?: string; submitLabel: string };
  successMessage: string;
  /** Có thể chứa {hotline}. */
  errorMessage: string;
  privacyNote?: RichText;
};

export type NotFoundPage = {
  title: string;
  body?: string;
  links: NavItem[];
};

export type PostSummary = {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: ImageRef;
  category?: { slug: string; title: string };
  noindex: boolean;
};

/** Bài đầy đủ cho /tin-tuc/[slug]. */
export type Post = PostSummary & {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ImageRef;
  body: RichText;
  /** Slug bài liên quan chọn tay; trống thì lấy cùng chủ đề. */
  relatedSlugs: string[];
};

export type SpecRow = {
  label: string;
  nominal?: string;
  grade?: "thieu" | "du" | "khac";
  actualThicknessMm?: number;
  sizeMm?: string;
  sheetsPerBundle?: string;
  note?: string;
};

/** Nhóm sản phẩm (anchor /san-pham#{slug}, tham số /bao-gia?loai={slug}). Không có giá (REQ-14). */
export type ProductGroup = {
  slug: string;
  title: string;
  order: number;
  nominalLabel: string;
  actualRangeMm?: { min: number; max: number };
  sheetsPerBundle?: string;
  description?: string;
  /** Nhãn nhỏ trên thẻ (vd "Phổ biến"). */
  badge?: string;
  image?: ImageRef;
  specs: SpecRow[];
  quoteCtaLabel?: string;
};

export type Application = {
  slug: string;
  title: string;
  order: number;
  thicknessHint: string;
  /** slug các productGroup phù hợp. */
  recommendedGroups: string[];
  summary?: string;
  cardImage?: ImageRef;
  album: (ImageRef & { caption?: string })[];
};

export type Category = {
  slug: string;
  title: string;
  order: number;
  description?: string;
};

export type ContentMap = {
  siteSettings: SiteSettings;
  header: HeaderContent;
  footer: FooterContent;
  homePage: HomePage;
  productsPage: ProductsPage;
  quotePage: QuotePage;
  aboutPage: AboutPage;
  partnershipPage: PartnershipPage;
  newsPage: NewsPage;
  contactPage: ContactPage;
  /** null = chưa publish → route 404, không vào sitemap (REQ-21). */
  privacyPage: PrivacyPage | null;
  leadForms: LeadForms;
  notFoundPage: NotFoundPage;
  posts: PostSummary[];
  productGroups: ProductGroup[];
  applications: Application[];
  categories: Category[];
};

export type ContentKey = keyof ContentMap;
