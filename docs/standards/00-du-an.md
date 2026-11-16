# Hồ sơ dự án: Nhựa WIN Việt Nam

> Mẫu điền cho **từng website**. Agent đọc tệp này đầu tiên.
> Ô nào chưa có thông tin thì ghi `missing_info`, kèm người cần hỏi. KHÔNG tự điền ([ND-05](04-noi-dung-cms.md#nd-05)).
> Điền ngày 16/11/2026 từ `.digiauto/inputs/facts.json`, `build_plan.json`, `design_tokens.json`, `mockup.json`
> và JSON-LD + footer của web cũ https://www.nhuawinvietnam.com.vn (đọc cùng ngày). Giá trị "web cũ" đang nằm trong seed (`seed/content.ts`) và chờ khách xác nhận trước khi nhập Sanity.

## 1. Doanh nghiệp (nguồn cho `siteSettings`, [GEO-03](03-geo.md#geo-03))

| Trường | Giá trị | Nguồn / người xác nhận |
|---|---|---|
| Tên thương hiệu (một tên dùng mọi nơi) | Nhựa WIN Việt Nam | facts.json `client.name` |
| Tên pháp lý · MST · năm thành lập | Công ty TNHH Nhựa WIN Việt Nam · MST `missing_info` · năm thành lập `missing_info` | Tên pháp lý: web cũ; MST / năm: hỏi khách (MI-15) |
| Ngành · loại schema | Sản xuất tấm Fomex (PVC foam), bán B2B cho nhà phân phối, đại lý vật liệu quảng cáo, nhà thầu · `LocalBusiness` (giữ như web cũ) | facts.json `client.industry`; schema: web cũ |
| Cơ sở (địa chỉ · Google Maps · giờ mở cửa) | Cụm công nghiệp Quất Động, xã Thượng Phúc, TP Hà Nội · https://maps.app.goo.gl/7VgHcAP3EXp4rP7T6 · Thứ 2 – Thứ 7 08:00–18:00, Chủ nhật 09:00–17:00 | Web cũ; địa chỉ đăng ký pháp lý `missing_info` (MI-15) |
| Hotline chính (một số) · số phụ | 0824 862 689 · 0979 072 186 | Web cũ; nhãn từng số `missing_info` (OQ-CM-07) |
| Zalo · Fanpage · YouTube · LinkedIn · GBP | Zalo zalo.me/0824862689 · Fanpage có link trên web cũ nhưng **chưa xác nhận** (MI-16, đang ẩn) · YouTube / LinkedIn / GBP `missing_info` | Web cũ; hỏi khách |
| Giấy phép / chứng nhận (có số) | `missing_info` | Hỏi khách (MI-11…MI-14: claim chưa xác minh) |
| Logo master · màu thương hiệu | Logo PNG 6000×2920 từ web cũ (bản 1440 px trong `public/images/brand/logo-win.png`); vector `missing_info` (MI-05, MI-25) · màu đề xuất từ logo + web cũ, chờ xác nhận (MI-06) | design_tokens.json |

## 2. Website

| Trường | Giá trị |
|---|---|
| Loại: mới / migration (URL site cũ) | Migration — https://www.nhuawinvietnam.com.vn (13 URL đang có chỉ mục) |
| Mục tiêu chính | Lead (báo giá, hợp tác, liên hệ) |
| Ngôn ngữ | `vi` (không `/en`, không hreflang) |
| Host chính | Phase này `*.vercel.app` (facts `domain.mode = vercel`); domain chính thức + apex/www `missing_info` (MI-17, OQ-SEO-02) |
| Index | Không (facts `launch.allowIndexing = no`, Q-25); mở chỉ mục cùng lúc chuyển tên miền (OQ-SEO-05, runbook T7.3) |
| Crawler AI | Mặc định cho cả 3 nhóm (tìm kiếm / người dùng hỏi / huấn luyện) — chờ khách chốt (OQ-SEO-04); cấu hình `lib/seo/ai-crawlers.ts` |
| Có giỏ hàng / thanh toán trực tuyến? | Không |
| Ngành có điều kiện quảng cáo? | Không |
| Trang sản phẩm / chi tiết: index hay không | Không có trang chi tiết riêng (4 nhóm + 7 ứng dụng nằm trong /san-pham); Product không có offers (OQ-SEO-06) |

## 3. Thiết kế (chốt ở G2, [GD-01](07-giao-dien.md#gd-01))

| Trường | Giá trị |
|---|---|
| Độ trung thành | Làm mới có kế thừa (facts `design.keepLook = no`); khách có thể muốn giữ giao diện cũ — `missing_info` (MI-23) |
| Mockup đã duyệt | 2 phương án PA1 "Xưởng mở" / PA2 "Bảng quy cách" (mockup.json, 14/11/2026) — **chưa duyệt** (MI-23). Khung tạm dùng lớp `pa1` |
| Phạm vi motion | Nhẹ (subtle): reveal opacity/transform 320 ms, 16 px; tắt khi reduced-motion |
| Font | Be Vietnam Pro (thân + tiêu đề PA1) + Barlow Semi Condensed (số liệu, tiêu đề PA2), subset vietnamese — chờ xác nhận (MI-06) |
| Chiến lược ảnh | Ảnh khách (facts `media.imageStrategy = client_photos`); quyền dùng ảnh web cũ `missing_info` (MI-10); ảnh 7 ứng dụng `missing_info` (MI-08) |

## 4. Lead & tracking

| Trường | Giá trị |
|---|---|
| `LEAD_DESTINATION` | `digiagent_crm` (facts `features.leadDestination`) |
| Form key CRM · `allowed_domains` | `missing_info` (MI-18) |
| Email nhận lead | Không áp dụng (đích CRM); người nhận thông báo `missing_info` (MI-18) |
| Các form | Báo giá (/bao-gia, chọn sẵn quy cách theo `?loai=`), Đăng ký hợp tác (/hop-tac — trường `missing_info` MI-18), Liên hệ (/lien-he) |
| GTM / GA4 / Search Console / pixel | `missing_info` (MI-19, MI-04) — không nhúng khi chưa có ID |
| Chat widget key | Không dùng |
| Câu đồng ý + link chính sách | Trang /chinh-sach-bao-mat mới; câu chữ chờ khách duyệt (MI-15 / OQ-SA-01) |

## 5. Migration

| Trường | Giá trị |
|---|---|
| Nguồn kiểm kê URL | sitemap + crawl web cũ (seo_plan.json — chưa có trong `.digiauto/inputs/` của bước này) |
| Số URL cũ · tệp map redirect | 13 URL (7 trang chính + 6 bài) · `redirect_map.json` / `legacy_url_map.json` `missing_info` ở bước này (cần cho T2.2, T6.1) |
| Tag / trigger tracking cũ đã kiểm kê | `missing_info` |
| DNS | Ngoài phạm vi đợt build (T7.3) |

## 6. Cần khách xác nhận

| # | Câu hỏi / dữ liệu thiếu | Hỏi ai | Trạng thái |
|---|---|---|---|
| 1 | Chọn phương án thiết kế PA1 / PA2 hay giữ giao diện cũ (MI-23) | Khách | Chờ |
| 2 | Pháp nhân, MST, địa chỉ đăng ký; duyệt chính sách bảo mật (MI-15, OQ-SA-01) | Khách | Chờ |
| 3 | Fanpage chính thức (MI-16); nhãn 2 SĐT (OQ-CM-07) | Khách | Chờ |
| 4 | Logo vector + logo ngang cho header (MI-05, MI-25); bộ nhận diện màu / font (MI-06) | Khách | Chờ |
| 5 | Quyền dùng ảnh web cũ (MI-10); ảnh thực tế 7 ứng dụng (MI-08) | Khách | Chờ |
| 6 | Endpoint + khoá digiagent_crm, trường form Hợp tác (MI-18) | Người vận hành | Chờ |
| 7 | Tên miền chính thức và thời điểm mở chỉ mục (MI-17, OQ-SEO-02, OQ-SEO-05) | Khách + người vận hành | Chờ |
| 8 | Chặn crawler AI huấn luyện hay không (OQ-SEO-04) | Khách | Chờ (mặc định cho phép) |
| 9 | Claim năng lực (MI-11…MI-14) trước khi đưa lên site | Khách | Chờ |
| 10 | ID GTM / GA4, quyền Search Console (MI-19, MI-04) | Khách | Chờ |

## 7. Lệch chuẩn (đã duyệt)

Mỗi lần làm khác luật **NÊN** hoặc **PHẢI** đều ghi vào đây. Luật **PHẢI** chỉ được lệch khi người vận hành duyệt.

| Mã luật | Làm khác thế nào | Lý do | Người duyệt · ngày |
|---|---|---|---|
| KT-04 (NÊN) | Không có thư mục `src/`; dùng `app/`, `components/`, `lib/`, `content/`, `seed/`, `sanity/`, `styles/` ở gốc | Đường dẫn file trong build_plan (vd `lib/env.ts`, `app/robots.ts`) không có `src/` | Chờ người vận hành |
| KT-06 | 404 cho URL lạ dùng `app/global-not-found.tsx` (cờ `experimental.globalNotFound`) thay vì catch-all `[...rest]` | Với `cacheComponents` (mặc định Next 16.4), catch-all trả vỏ lỗi rỗng không có nội dung trong HTML; global-not-found là cách Next khuyên cho nhiều root layout, trả 404 + đủ header/footer | Chờ người vận hành |
| SEO-01 | `ALLOW_INDEXING` nhận `"1"` hoặc `"true"`; điều kiện production là `VERCEL_ENV === "production"` (chặt hơn mẫu: không xét NODE_ENV) | build_plan T0.2 ghi `'true'`, chuẩn ghi `"1"`; host Vercel nên chỉ tin VERCEL_ENV | Chờ người vận hành |
| GD-04 | Script `html.js` đặt đầu `<body>` (đồng bộ) thay vì trong `<head>` | ESLint của Next cảnh báo `<head>` / `beforeInteractive`; script đầu body vẫn chạy trước khi nội dung được vẽ | Chờ người vận hành |
