/** Kiểu dữ liệu chung trả ra từ cửa nội dung (KT-01). Mọi trang / component chỉ dùng các kiểu này. */

export type ImageRef = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type CmsLink =
  | { kind: "internal"; path: string; anchor?: string }
  | { kind: "external"; url: string };

export type NavItem = {
  label: string;
  link: CmsLink;
  children: NavItem[];
};

export type Phone = { number: string; label?: string };

export type SocialPlatform = "facebook" | "youtube" | "tiktok" | "linkedin" | "google_business";

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
  street?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country: string;
  mapUrl?: string;
  geo?: { lat: number; lng: number };
};

export type SiteSettings = {
  brandName: string;
  legalName?: string;
  slogan?: string;
  description?: string;
  schemaType: "Organization" | "LocalBusiness";
  logo?: ImageRef;
  defaultOgImage?: ImageRef;
  address?: Address;
  phones: Phone[];
  email?: string;
  zalo?: { url: string; label: string };
  socials: SocialLink[];
  openingHours: OpeningHours[];
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
  columns: { title: string; items: NavItem[] }[];
  privacyLink?: NavItem;
};

export type HomePage = {
  seo: Seo;
  hero: {
    eyebrow?: string;
    titleLines: string[];
    lead?: string;
    cta?: NavItem;
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
  noindex: boolean;
};

export type ContentMap = {
  siteSettings: SiteSettings;
  header: HeaderContent;
  footer: FooterContent;
  homePage: HomePage;
  notFoundPage: NotFoundPage;
  posts: PostSummary[];
};

export type ContentKey = keyof ContentMap;
