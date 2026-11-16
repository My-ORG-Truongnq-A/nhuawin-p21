# Đo lường & lead — Nhựa WIN (TR-01…TR-03, LD-01…LD-05)

## 1. Nạp thẻ (TR-01, HN-05)

| Điều kiện | Kết quả |
|---|---|
| `VERCEL_ENV !== "production"` (preview, dev, e2e) | Không nhúng gì |
| Production + `NEXT_PUBLIC_GTM_ID` hợp lệ (`GTM-…`) | **GTM-only**: GA4 và mọi tag cấu hình trong container |
| Production + chỉ `NEXT_PUBLIC_GA_ID` hợp lệ (`G-…`) | gtag trực tiếp |
| ID trống / sai định dạng | Không nhúng gì |

- Hàng đợi `dataLayer` dựng ngay bằng script inline (`#tracking-queue`); thư viện nạp ở tương tác đầu (pointerdown / keydown / touchstart / scroll) hoặc sau 4 s; URL có `gclid` / `gbraid` / `wbraid` / `fbclid` → nạp ngay.
- Không nhúng trong `/studio`. Đổi ID phải redeploy.
- Code: `lib/analytics/config.ts`, `components/analytics/`.

## 2. Bảng sự kiện (TR-03)

| Sự kiện | Khi nào | Tham số (không PII) |
|---|---|---|
| `generate_lead` | Server xác nhận đã giao lead (có `requestId`); bot / lỗi → không bắn | `form_name` (`contact_form` · `quote_form` · `partnership_form`), `form_type` (`contact` · `quote` · `partnership`), `page_path` |
| `click_phone` | Bấm `tel:` | `link_location`, `page_path` |
| `click_zalo` | Bấm `zalo.me` | `link_location`, `page_path` |
| `click_messenger` / `click_fanpage` | Bấm `m.me` / facebook.com | `link_location`, `page_path` |
| `click_email` | Bấm `mailto:` | `link_location`, `page_path` |
| `click_directions` | Bấm link Google Maps | `link_location`, `page_path` |

- `generate_lead` chống đếm đúp theo `requestId` (`lib/analytics/events.ts`).
- Click liên hệ đo bằng một listener ở `document` (pha capture); `link_location` = `data-track-area` › id section › `header` / `footer` › `aria-label`.
- Chưa đo: `cta_click` (cần gắn `data-track-area` cho CTA chính).
- GTM: trigger Custom Event regex `^(generate_lead|click_.+)$`; key event `generate_lead`, `click_phone`, `click_zalo`; custom dimension (Event) `form_type`, `link_location`.

## 3. Nguồn lead (LD-05)

| Cookie | Mô hình | Ghi khi |
|---|---|---|
| `lead_ft` | first-touch | Lượt tải trang đầu tiên (kể cả direct); không ghi đè |
| `lead_lt` | last non-direct | Lượt có UTM / click ID / referrer ngoài site; thay **cả bộ** |

30 ngày, `SameSite=Lax`, `Secure` trên https. Lưu `utm_*`, `gclid` / `gbraid` / `wbraid` / `fbclid`, landing path, origin của referrer. Server action đọc 2 cookie và gửi theo lead (`context` của CRM / mail).

## 4. Biến môi trường lead

| Biến | Dùng cho |
|---|---|
| `LEAD_DESTINATION` | `digiagent_crm` (mặc định) · `sanity_gmail` |
| `DGA_API_URL`, `DGA_FORM_KEY` | `POST {DGA_API_URL}/api/v1/public/forms/{DGA_FORM_KEY}/submit` ⚠ chưa kiểm trên tài khoản thật (MI-18) |
| `SANITY_API_WRITE_TOKEN` | `sanity_gmail`: lưu `lead.<uuid>` |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_SENDER` (tuỳ chọn), `LEAD_TO_EMAIL` | `sanity_gmail`: mail thông báo qua Gmail API |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` (hoặc `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) | Rate limit bền (5 lượt hợp lệ / 10 phút / IP / loại form) + khoá idempotent 24 giờ |
| `LEADS_DRY_RUN=1` | Preview / test: không gửi lead thật. Production bỏ qua cờ này |

## 5. Kiểm sau go-live (LD-10, TR-07)

Gửi form thật "TEST – vui lòng bỏ qua" (báo khách trước) → lead vào CRM (người xác nhận), thông báo thành công đúng, `generate_lead` ở GA4 Realtime / DebugView.
