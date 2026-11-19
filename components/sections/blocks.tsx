import Link from "next/link";
import type { ReactNode } from "react";
import { ContactList } from "@/components/contact/ContactList";
import { RichText } from "@/components/content/RichText";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/layout/Container";
import { CmsImage } from "@/components/media/CmsImage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getLeadForms, getSiteSettings } from "@/lib/content";
import { addressLine } from "@/lib/contact/links";
import type { Faq, Feature, ImageRef, MessageFormBlock as MessageFormValue, NavItem, PostSummary, ProcessStep, SectionHeading } from "@/lib/content/types";
import { resolveLink } from "@/lib/nav/resolve-link";

/** Khối dùng chung của template P4. Ảnh qua CmsImage (loader); chỉ ảnh hero của trang được `lcp`. */

export function SectionHeader({ heading, id, dark = false, as = "h2" }: { heading?: SectionHeading; id?: string; dark?: boolean; as?: "h2" | "h3" }) {
  if (!heading?.title && !heading?.eyebrow) return null;
  const H = as;
  return (
    <div className="max-w-3xl">
      {heading.eyebrow && (
        <p className={`mb-3 text-xs font-bold uppercase tracking-label ${dark ? "text-cyan-200" : "text-brand-ink"}`}>{heading.eyebrow}</p>
      )}
      {heading.title && (
        <H id={id} className={`text-3xl font-extrabold ${dark ? "text-surface" : ""}`}>
          {heading.title}
        </H>
      )}
      {heading.intro && <p className={`mt-4 text-lg ${dark ? "text-surface/85" : "text-muted"}`}>{heading.intro}</p>}
    </div>
  );
}

export function NavButton({ item, variant = "primary", size = "lg" }: { item?: NavItem; variant?: "primary" | "secondary" | "hot"; size?: "md" | "lg" }) {
  if (!item) return null;
  const { href } = resolveLink(item.link);
  return (
    <ButtonLink href={href} variant={variant} size={size}>
      {item.label}
    </ButtonLink>
  );
}

export function FeatureGrid({ items, numbered = false, cols = 3 }: { items: Feature[]; numbered?: boolean; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <ul className={`mt-10 grid gap-6 ${grid}`}>
      {items.map((f, i) => (
        <li key={f.title} data-reveal className="overflow-hidden rounded-card border border-line bg-surface shadow-xs">
          {f.image && <CmsImage image={f.image} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[16/10] w-full object-cover" />}
          <div className="p-6">
            {numbered && <p className="font-spec text-2xl font-bold text-brand-ink">{String(i + 1).padStart(2, "0")}</p>}
            <h3 className="text-xl font-bold">{f.title}</h3>
            {f.text && <p className="mt-2 text-muted">{f.text}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StepList({ steps, label = "Bước", dark = false }: { steps: ProcessStep[]; label?: string; dark?: boolean }) {
  return (
    <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} data-reveal className={`rounded-card border p-6 ${dark ? "border-surface/20 bg-surface/5" : "border-line bg-surface"}`}>
          <p className={`font-spec text-sm font-bold uppercase tracking-label ${dark ? "text-cyan-200" : "text-brand-ink"}`}>
            {label} {i + 1}
          </p>
          <h3 className={`mt-2 text-lg font-bold ${dark ? "text-surface" : ""}`}>{s.title}</h3>
          {s.text && <p className={`mt-2 text-sm ${dark ? "text-surface/80" : "text-muted"}`}>{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/** 6 công đoạn: ảnh + số thứ tự. */
export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} data-reveal className="overflow-hidden rounded-card border border-line bg-surface">
          {s.image && <CmsImage image={s.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10] w-full object-cover" />}
          <div className="p-5">
            <p className="font-spec text-2xl font-bold text-brand-ink">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
            {s.text && <p className="mt-1 text-sm text-muted">{s.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FaqSection({ faq, eyebrow = "Hỏi đáp", aside }: { faq?: Faq; eyebrow?: string; aside?: ReactNode }) {
  if (!faq?.items.length) return null;
  return (
    <section id="hoi-dap" aria-labelledby="faq-title" className="bg-surface-2 py-section">
      <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <SectionHeader heading={{ eyebrow, title: faq.title ?? "Câu hỏi thường gặp" }} id="faq-title" />
          {aside && <div className="mt-4 text-muted">{aside}</div>}
        </div>
        <div className="divide-y divide-line rounded-card border border-line bg-surface">
          {faq.items.map((i) => (
            <details key={i.question} className="group p-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                {i.question}
                <span aria-hidden="true" className="text-brand-ink transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <RichText value={i.answer} className="mt-3 text-muted" />
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Khối thông tin nhanh (REQ-27, GEO): 5 dòng render ở server, NAP từ siteSettings. */
export async function QuickFacts() {
  const s = await getSiteSettings();
  const contact = [
    s.phones.map((p) => p.number).join(" · "),
    s.zalo ? "Zalo" : undefined,
    s.email,
    s.openingHours.map((h) => `${h.label} ${h.opens}–${h.closes}`).join("; "),
  ].filter(Boolean);
  const rows: [string, string | undefined][] = [
    ["Ai", s.legalName ?? s.brandName],
    ["Làm gì", s.quickFacts?.what],
    ["Ở đâu", [addressLine(s.address), s.areaServed ? `giao hàng ${s.areaServed === "Việt Nam" ? "toàn quốc" : s.areaServed}` : undefined].filter(Boolean).join("; ")],
    ["Cho ai", s.quickFacts?.forWhom],
    ["Liên hệ", contact.join(" · ")],
  ];
  return (
    <aside aria-label="Thông tin nhanh" className="bg-surface py-12">
      <Container>
        <dl className="grid gap-x-8 gap-y-3 rounded-card border border-line bg-surface-2 p-6 text-sm sm:grid-cols-[8rem_1fr]">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-bold text-ink">{k}</dt>
                <dd className="text-body">{v}</dd>
              </div>
            ))}
        </dl>
      </Container>
    </aside>
  );
}

/** Khối form tin nhắn (#lien-he) — câu chữ mặc định ở leadForms (S3 / MI-24). */
export async function MessageFormSection({ block, page, id = "lien-he" }: { block?: MessageFormValue; page: string; id?: string }) {
  const [forms, settings] = await Promise.all([getLeadForms(), getSiteSettings()]);
  const heading = block?.heading ?? forms.messageFormDefault.heading;
  const sub = block?.subheading ?? forms.messageFormDefault.subheading;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bg-ink-950 py-section text-surface">
      <Container className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-label text-cyan-200">Liên hệ ngay</p>
          <h2 id={`${id}-title`} className="text-3xl font-extrabold text-surface">
            {heading}
          </h2>
          {sub && <p className="mt-4 text-lg text-surface/85">{sub}</p>}
          <div className="mt-8 rounded-card bg-surface p-6 text-body">
            <ContactList settings={settings} />
          </div>
        </div>
        <LeadForm
          kind="contact"
          page={page}
          tone="dark"
          submitLabel={forms.contact.submitLabel}
          roleOptions={forms.contact.roleOptions}
          needOptions={forms.contact.needOptions}
          notePlaceholder={forms.contact.notePlaceholder}
          privacyNote={forms.privacyNote ? <RichText value={forms.privacyNote} /> : undefined}
        />
      </Container>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  const all = [{ name: "Trang chủ", path: "/" }, ...items];
  return (
    <nav aria-label="Đường dẫn" className="text-sm">
      <ol className="flex flex-wrap gap-x-2 text-surface/80">
        {all.map((c, i) => (
          <li key={c.name} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.path && i < all.length - 1 ? (
              // Vùng chạm ≥ 44 px ở mobile (MB-05: breadcrumb).
              <Link href={c.path} className="inline-flex items-center hover:text-surface max-md:min-h-11">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-surface">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Hero trang con: breadcrumb, nhãn, H1 (duy nhất), đoạn mở, CTA; ảnh nền là LCP (không fade). */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  crumbs: { name: string; path?: string }[];
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: ImageRef;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="relative isolate overflow-hidden bg-ink-950 py-section text-surface">
      {image && (
        <>
          <CmsImage image={image} lcp fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink-950/75" />
        </>
      )}
      <Container>
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="mt-8 text-xs font-bold uppercase tracking-label text-cyan-200">{eyebrow}</p>}
        <h1 id="page-title" className={`${eyebrow ? "mt-3" : "mt-8"} max-w-[22ch] text-4xl font-extrabold text-surface`}>
          {title}
        </h1>
        {intro && <p className="mt-6 max-w-prose text-lg text-surface/85">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </section>
  );
}

const dateVi = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso)) : undefined;

export function PostCard({ post, headingLevel = "h3" }: { post: PostSummary; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <li data-reveal>
      <Link href={`/tin-tuc/${post.slug}`} className="group block">
        {post.image && (
          <CmsImage image={post.image} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10] w-full rounded-card object-cover" />
        )}
        <p className="mt-3 text-xs font-bold uppercase tracking-label text-brand-ink">
          {post.category?.title}
          {post.publishedAt && (
            <span className="font-medium normal-case tracking-normal text-subtle">
              {post.category ? " · " : ""}
              <time dateTime={post.publishedAt}>{dateVi(post.publishedAt)}</time>
            </span>
          )}
        </p>
        <H className="mt-2 text-lg font-bold group-hover:text-brand-ink">{post.title}</H>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>}
      </Link>
    </li>
  );
}

export { dateVi };
