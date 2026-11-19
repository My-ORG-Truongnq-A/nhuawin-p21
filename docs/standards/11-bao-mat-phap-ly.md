# 11 · Bảo mật & pháp lý (`BM`)

> **Lưu ý về pháp lý:** phần pháp lý Việt Nam dựa trên bản tin / tóm tắt (EY, PwC, Thư viện pháp luật), tra ngày 16/11/2026. Chưa đối chiếu nguyên văn điều khoản. Mẫu văn bản chính sách và câu đồng ý **phải được luật sư hoặc người phụ trách pháp lý của khách duyệt** trước go-live.

<a id="bm-01"></a>
### BM-01 · Header bảo mật mặc định — PHẢI
- `next.config.ts` `headers()` áp cho mọi route:

| Header | Giá trị |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN`, kèm CSP `frame-ancestors 'self'` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`; bỏ `payment=()` khi site có thanh toán trực tuyến |

- `poweredByHeader: false`.
- HSTS để Vercel tự thêm. Thêm `includeSubDomains` / `preload` chỉ sau khi rà mọi subdomain.
- **Header ở site chính đè header của origin được rewrite.** Rule header phải loại trừ đường rewrite. Ví dụ với rewrite `/tool/*` của `P3`: `source: "/:path((?!tool(?:/|$)).*)"`; thay `tool` bằng đường rewrite của dự án.
- **Kiểm:** `curl -sI` URL công khai sau deploy; test khoá cấu hình header.
- **Nguồn:**
  - `P1` / `P2` `SECURITY_HEADERS`.
  - `P3 fcb2386`: trước đó chỉ có HSTS, ai cũng nhúng được.
  - `P3 b05cf65`: CSP của `/tool/*` bị đè 2 tháng.
  - `P6 KT-18`; `P5`, `P7`, `P8`: không có header.

<a id="bm-02"></a>
### BM-02 · CSP — NÊN (Report-Only trước, thật sau go-live)
- Danh sách host phải chốt trước: GTM / GA4, pixel, CDN Sanity, widget chat, YouTube, Maps, CRM.
- **Host GA4 phải đủ:** `www.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`, `*.google.com`, `*.google.com.vn` (Google Signals), `*.g.doubleclick.net`.
  - Lưu ý: `*.analytics.google.com` **không** khớp `analytics.google.com` hay `www.google.com`.
- Có `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`. Tránh `unsafe-inline`; dùng nonce / hash khi được.
- Bắt đầu bằng `Content-Security-Policy-Report-Only`, theo dõi lỗi console, rồi mới bật thật. Có test khoá chuỗi CSP.
- Studio có CSP riêng hoặc được loại trừ.
- **Nguồn:**
  - `P4 47db426`, `39bc0b1`: CSP chặn mọi hit GA4.
  - `P4 eeb36e4`.
  - `P4` `vercel-config.test.ts`.
  - `P2` B5; `P1`: chưa có CSP.

<a id="bm-03"></a>
### BM-03 · Secret và deploy — PHẢI
- Secret chỉ ở env của Vercel. Token ghi (Sanity write, SMTP) chỉ dùng ở server.
- `.env*` được ignore ([KT-09](01-kien-truc.md#kt-09)); `.env.example` chỉ chứa placeholder.
- KHÔNG có webhook / API key trong source. Lộ thì **rotate ngay**.
- Deploy chỉ từ git, qua CI. KHÔNG `vercel --prod` upload thư mục làm việc.
- Trong CI: ghim phiên bản CLI; thiếu token thì **fail**, không bỏ qua mà vẫn xanh.
- **Nguồn:**
  - `P7 077a14d`: `.codex` chứa API key bị upload.
  - `P1 06d76bd`.
  - `P3 023ca6d`: webhook Slack trong source.
  - `P4`: workflow bỏ qua khi thiếu token.

<a id="bm-04"></a>
### BM-04 · Webhook, cron, API công khai — PHẢI
- **Webhook revalidate:** kiểm chữ ký; thiếu secret thì trả 500 ([KT-02](01-kien-truc.md#kt-02)).
- **Route cron:** kiểm `Authorization: Bearer $CRON_SECRET`; khai `maxDuration`, có ngân sách thời gian.
- **API công khai:** kiểm `Origin` / `Referer` theo allowlist (`=== h || endsWith("." + h)`, không có `localhost` ở production); honeypot; CAPTCHA dùng một lần; quota theo IP và toàn cục; trả `Retry-After` kèm 503.
- **Escape đầu ra:**
  - JSON-LD: escape `<` ([GEO-02](03-geo.md#geo-02));
  - mail HTML: `escapeHtml` mọi giá trị;
  - CSV xuất: trung hoà công thức.
- **Nguồn:** `P1`, `P2`, `P7` `api/revalidate`; `P8`, `P4` cron; `P4` `api/_origin.ts`; `P1` `lead-csv.ts`.

<a id="bm-05"></a>
### BM-05 · Dependency có lỗ hổng — PHẢI
- Trước go-live và mỗi tháng: `pnpm audit --prod`, không còn critical / high chưa xử lý.
- Next.js ghim bản vá mới nhất ([KT-07](01-kien-truc.md#kt-07)).
- **Nguồn:** `P2 83c154f`, `f2ca8c8`; `P7 807ba2a`.

<a id="bm-06"></a>
### BM-06 · Trang pháp lý và thông tin doanh nghiệp — PHẢI
- **Footer có:**
  - tên pháp lý, MST, địa chỉ, hotline, email (từ `siteSettings`);
  - link **Chính sách quyền riêng tư** (`/chinh-sach-bao-mat`) và **Điều khoản sử dụng**;
  - khi có bán hàng / dịch vụ: thêm chính sách đổi trả / bảo hành / thanh toán / giao nhận.
- Nền tảng quảng cáo / mạng xã hội đối chiếu pháp nhân trên site (LinkedIn, Meta, TikTok). Nên có thêm nhãn tiếng Anh "Privacy Policy · Terms of Service" và trang `/data-deletion` nếu dùng Meta login / app.
- Văn bản pháp lý mô tả **tính năng có thật**. Thêm bên thứ ba thì tăng version. KHÔNG tự thêm điều khoản khách chưa cung cấp (để `missing_info`).
- **Nguồn:**
  - `P3 8a84ab7`: LinkedIn từ chối xác minh.
  - `P3 7f5db9e`: TikTok từ chối.
  - `P7`: không có trang pháp lý nào.
  - `P6 KT-19`.
  - `P8 a3c8ca6`: `/chinh-sach` có `TODO`.

<a id="bm-07"></a>
### BM-07 · Dữ liệu cá nhân: Luật 91/2025 + NĐ 356/2025 — PHẢI
- Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP **có hiệu lực từ 01/01/2026, thay NĐ 13/2023** ([web], độ chắc chắn cao). Chi tiết về cách xin đồng ý và thời hạn xử lý: độ chắc chắn trung bình. Mức phạt theo NĐ 330/2026: chưa đọc nguyên văn, độ chắc chắn thấp. Phần chi tiết cần người phụ trách pháp lý xác nhận.
- **Form lead PHẢI có:**
  1. Ô đồng ý **không tích sẵn**, tách riêng với ô đồng ý nhận marketing (nếu có).
  2. Câu nêu mục đích, loại dữ liệu, bên nhận / xử lý (vd. CRM), thời hạn lưu, quyền (rút đồng ý, xoá). Link chính sách đặt ngay cạnh form.
  3. **Lưu bằng chứng đồng ý** theo lead: thời điểm, nội dung câu, version (hash của câu + chính sách), URL chính sách.
  4. Chỉ thu trường cần thiết.
- **Quy trình nội bộ:** có quy trình rút đồng ý / xoá dữ liệu; phản hồi trong 2 ngày làm việc (chi tiết cần đối chiếu văn bản).
- **Dữ liệu nhạy cảm** (sức khoẻ, tình trạng da…): KHÔNG thu qua form chung khi chưa có cơ sở pháp lý và biện pháp bảo vệ. Site y tế: form chỉ hỏi nhu cầu chung.
- **Tracking quảng cáo:** chỉ chạy khi đã có đồng ý ([TR-05](10-tracking.md#tr-05)). NÊN có banner cookie / tracking có lựa chọn.
- **Nguồn:**
  - `P1 c34ed07`: câu đồng ý có version.
  - `P2` TASKS #12, `P6 KT-19`, `P5`: chưa có ô đồng ý.
  - `P3 096553c` (chính sách theo Luật 91 + NĐ 356).
  - [web] Luật 91/2025, NĐ 356/2025.

<a id="bm-08"></a>
### BM-08 · Quảng cáo ngành đặc thù — PHẢI
- **Y tế / thẩm mỹ có can thiệp / dược / thực phẩm chức năng:**
  - Hỏi khách giấy phép hoạt động và **giấy xác nhận nội dung quảng cáo** (Sở Y tế) trước khi đăng nội dung quảng cáo (cam kết kết quả, ảnh trước–sau, so sánh, khuyến mại).
  - Lưu số và ngày giấy xác nhận trong CMS, hiển thị ở chân bài.
- **KHÔNG** cam kết tuyệt đối: "100% hiệu quả", "an toàn tuyệt đối", "vĩnh viễn", "không đau", "FDA" khi không có chứng cứ.
- Ảnh minh hoạ tách khỏi ca thực tế; ca thực tế ghi mốc thời gian, cách đo và có quyền dùng ảnh.
- Hồ sơ bác sĩ có họ tên đầy đủ và chứng chỉ kiểm chứng được.
- **Ngành có điều kiện khác** (xuất khẩu lao động, du học, tài chính): hiển thị số giấy phép thật. KHÔNG hứa kết quả (visa, lợi nhuận).
- **Nguồn:**
  - `P6 c720e6f`, review.md P1 / P2.
  - `P1 789144c` ("no visa promise").
  - [web] Luật Quảng cáo / NĐ 181 (độ chắc chắn trung bình–thấp, cần hỏi luật sư).

<a id="bm-09"></a>
### BM-09 · Website bán hàng trực tuyến — PHẢI hỏi trước
- Luật Thương mại điện tử 122/2025/QH15 + NĐ 248/2026 có hiệu lực **01/07/2026** ([web]).
- **Site có giỏ hàng / đặt hàng / thanh toán trực tuyến:**
  - phải làm **thủ tục thông báo** trước khi vận hành;
  - hiển thị thông tin đã thông báo;
  - có điều khoản giao dịch và chính sách đổi trả / bảo mật / thanh toán / vận chuyển.
- **Site chỉ giới thiệu + form liên hệ:** theo nguồn thứ cấp thì không thuộc diện thông báo, nhưng vẫn cần thông tin doanh nghiệp + chính sách quyền riêng tư.
- Cơ quan tiếp nhận thông báo chưa xác minh nguyên văn. Ghi vào checklist "cần luật sư xác nhận".
- **Nguồn:** [web] Luật TMĐT 2025, NĐ 248/2026 (nguồn thứ cấp về phạm vi).
