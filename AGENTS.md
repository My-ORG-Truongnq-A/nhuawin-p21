# Quy ước cho agent (DigiForge)

Website này dựng theo **bộ chuẩn website marketing của DigiForge** trong `docs/standards/`: luật có mã (PHẢI / NÊN / KHÔNG) và checklist nghiệm thu.

- Chỉ đọc tệp chủ đề liên quan tới việc đang làm (mục lục ở `docs/standards/README.md`), không đọc hết bộ. Việc dựng / sửa code: đọc thêm `docs/standards/00-du-an.md`.
- Không nới luật PHẢI. Làm khác chuẩn thì ghi vào mục "Lệch chuẩn" của `docs/standards/00-du-an.md`, kèm lý do.
- Chỉ điền `00-du-an.md`; không sửa các tệp chuẩn khác (DigiForge chép lại từ nguồn chung).
- Next.js 16 có API khác dữ liệu huấn luyện: đọc `node_modules/next/dist/docs/` trước khi code.

## Quy ước của repo

- Nội dung chỉ đọc qua `lib/content` (một cửa, có seed `seed/content.ts`). Không hard-code NAP / dữ kiện doanh nghiệp — `pnpm check:hardcode` chặn.
- Host chỉ đọc qua `lib/site-url.ts`; index chỉ qua `lib/indexing.ts`. Metadata mọi route qua `pageMetadata()` / `buildMetadata()`.
- Token chỉ ở `styles/tokens.css`; component không dùng hex lẻ.
- Sanity gói Free: test / e2e / build cục bộ chạy `SANITY_SOURCE=seed`; không viết test gọi Sanity (rào `tests/setup/no-network.ts`).
- Trước commit: `pnpm verify` (typecheck · lint · test · check:hardcode); trước khi xong: thêm `pnpm build` và `pnpm e2e`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
