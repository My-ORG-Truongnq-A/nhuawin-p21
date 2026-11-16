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
  areaServed?: string;
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
  album: ImageRef[];
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
  notFoundPage: NotFoundPage;
  posts: PostSummary[];
  productGroups: ProductGroup[];
  applications: Application[];
  categories: Category[];
};

export type ContentKey = keyof ContentMap;
