# nhuawin-p21

Website Nhựa WIN Việt Nam — DigiForge. Next.js 16 (App Router) + Sanity (Studio `/studio`) + Tailwind v4, deploy Vercel.

## Lệnh

```bash
pnpm install
pnpm dev                      # http://localhost:3000 (seed nếu chưa có projectId)
pnpm verify                   # typecheck · lint · test · check:hardcode
SANITY_SOURCE=seed pnpm build # build bằng seed, không gọi Sanity
pnpm e2e                      # Playwright (tự chạy bản build ở cổng 3200)
```

Biến môi trường: xem `.env.example`. Chuẩn dự án: `docs/standards/` (bắt đầu từ `00-du-an.md`).

## Cấu trúc

```
app/(site)/             trang công khai (root layout: header, footer, nút liên hệ nổi)
app/(studio)/studio/    Sanity Studio (root layout riêng, noindex)
app/global-not-found    404 cho URL không khớp route
app/{robots.ts,llms.txt,sitemap.xml,sitemaps/*}  route SEO / GEO
app/api/revalidate      webhook Sanity → revalidateTag theo loại
components/             layout, contact, brand, ui, seo, motion
content/                cờ trung tâm (routes, features)
lib/                    content (một cửa), env, site-url, indexing, seo/*, sanity/*
seed/                   dữ liệu dự phòng khi chưa nối Sanity
sanity/                 schema, structure, env của Studio
styles/tokens.css       nguồn token duy nhất
tests/                  setup (rào no-network), e2e, repo
```
