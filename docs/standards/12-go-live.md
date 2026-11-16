# 12 · Go-live & vận hành (`GL`)

Phase này website go-live trên `<slug>.vercel.app` (noindex, Q-25 / Q-27).

Các luật về domain thật (DNS, MX, Search Console) áp dụng khi khách có domain riêng: chuyển từ site cũ, hoặc khi DigiForge có domain chung.

<a id="gl-01"></a>
### GL-01 · Runbook go-live có mốc và điều kiện rollback — PHẢI
- **T-3 ngày:**
  - sao lưu DNS, dataset CMS, ID deployment hiện tại;
  - **chép đủ MX / SPF / TXT** sang vùng DNS mới **trước** khi đổi NS;
  - xác định NS có thẩm quyền (`.vn` thì hỏi VNNIC);
  - hạ TTL nếu được; lưu IP / cách mở site cũ; diễn tập.
- **T:** đặt env production đủ ([GL-02](#gl-02)) → redeploy → đổi DNS → đợi Vercel báo "Valid Configuration".
- **T+1 giờ:** kiểm 10 điểm:
  1. 200, không có noindex ngoài ý muốn;
  2. redirect www / http đúng chiều;
  3. `robots.txt` đúng;
  4. sitemap `<loc>` đúng host;
  5. `check-urls` 0 lệch;
  6. form thật ([LD-10](09-lead.md#ld-10));
  7. sửa thử trong Studio → trang đổi (webhook);
  8. email của khách vẫn chạy;
  9. `og:*` hiển thị trên Facebook / Zalo;
  10. Search Console + Bing đã nộp sitemap.
- **Điều kiện rollback có số:**
  - > 0,5 % URL lỗi;
  - 5xx lặp lại;
  - form không gửi được;
  - TLS lỗi > 30 phút;
  - email gián đoạn.
  - Cách rollback: "Promote previous deployment" / `vercel rollback`.
- **KHÔNG** huỷ hosting cũ khi còn mail / domain khác. Giữ site cũ ≥ 4 tuần. Crawl bù nội dung mới ngay trước khi đổi DNS.
- **Nguồn:** `P1` `docs/superpowers/plans/2026-10-13-P1-system-audit.md` §8; `P2` TASKS #23; `P7` (webhook suýt trỏ vào WordPress cũ); `P1 5e449a8`.

<a id="gl-02"></a>
### GL-02 · Cổng chặn go-live — PHẢI
Không go-live khi còn mục nào dưới đây sai:
- **Env production đủ:**
  - Sanity: project / dataset / token, `SANITY_REVALIDATE_SECRET`;
  - đích lead: CRM key hoặc mail;
  - `NEXT_PUBLIC_SITE_URL` = host cuối;
  - `ALLOW_INDEXING` đúng quyết định;
  - GTM / GA nếu có.
  - Diff env preview ↔ production.
- Cửa nội dung **không đang dùng seed** ([KT-01](01-kien-truc.md#kt-01)).
- HTML production không có `localhost` / `vercel.app` (trừ khi đó là host chính thức).
- `sitemap.xml`, `robots.txt` (và `llms.txt` nếu có) trả 200. Mọi ảnh 200. Redirect đúng mã và đích. `og:image` 200 không qua redirect.
- Khi có GTM / GA4: GA4 nhận hit, `generate_lead` đã thấy ở Realtime.
- Không còn dấu vết khách khác ([KT-08](01-kien-truc.md#kt-08)), placeholder `missing_info` hay Lorem ipsum.
- Test + typecheck + build xanh trong CI.
- **Nguồn:**
  - `P7`: seed che việc CMS chưa nối.
  - `P2` TASKS #17, #22: noindex và form "bảo trì" sau go-live.
  - `P5`: `NEXT_PUBLIC_SITE_URL` là localhost suốt 43 ngày.
  - `P2`: 19 suite đỏ vẫn deploy.

<a id="gl-03"></a>
### GL-03 · Đổi env thì redeploy và kiểm HTML thật — PHẢI
- `NEXT_PUBLIC_*`, `ALLOW_INDEXING` và header trong `next.config.ts` được **chốt lúc build**. Đổi xong PHẢI redeploy.
- Sau redeploy kiểm bằng `curl` / grep bundle trên URL thật: header `X-Robots-Tag`, `robots.txt`, canonical, ID GTM.
- Purge ISR có thể còn hai bản cache: ép redeploy.
- **Nguồn:** `P2` TASKS #17; `P1` `next.config.ts`; `P7` `docs/tracking.md` §1; `P3 cb7316d`.

<a id="gl-04"></a>
### GL-04 · Đổi domain / host chính — PHẢI
Thứ tự:
1. Kiểm apex + www cùng về nền tảng mới (nhiều resolver; `curl` thẳng IP).
2. Đặt domain chính; domain phụ 301 / 308 về.
3. Cập nhật `NEXT_PUBLIC_SITE_URL`, CORS Sanity, webhook Sanity (dùng host chính).
4. Redeploy ([GL-03](#gl-03)).
5. Nộp lại sitemap, xoá sitemap cũ.
6. Kiểm preview Facebook / Zalo trên từng domain. Zalo không theo redirect, nên chia sẻ link host chính.

- **Nguồn:** `P7 4386cea`; `P8`: đổi www → apex làm CORS Sanity hỏng.

<a id="gl-05"></a>
### GL-05 · Theo dõi 4 tuần sau go-live — PHẢI
- **Mỗi ngày tuần đầu**, sau đó mỗi tuần:
  - log 404 của Vercel → bổ sung redirect;
  - Search Console: Pages, email cảnh báo (JobPosting / Breadcrumbs / Product), CWV;
  - lead nhận được so với trước.
- Theo dõi deploy bằng API / CLI (`vercel inspect --wait`). KHÔNG poll site production liên tục: Vercel Security Checkpoint sẽ trả 403.
- Hỏi thử AI theo bộ câu cố định ([GEO-08](03-geo.md#geo-08)).
- **Nguồn:** `P1 d1a172a`: 10 lần 404 trong 2 giờ đầu; `P1 dfea273`, `adb900d` (email GSC); `P2` (tài liệu 12/11).

<a id="gl-06"></a>
### GL-06 · CI/CD — PHẢI
- PR chạy job `ci`: `lint · typecheck · test · build`. Đây là required check của `main` (do `github.configure_ci` bật).
- Không deploy khi test đỏ. Preview cho mỗi PR; QA chạy trên preview đúng commit.
- Deploy production: `concurrency` không huỷ job đang chạy; ghim phiên bản CLI.
- Script QA (perf, chụp ảnh, audit) nằm **trong repo**, không để ở thư mục tạm.
- **Nguồn:**
  - `P2`, `P1`, `P7`, `P3`: không có CI chạy test.
  - `P4 6bfca9e`.
  - `P7`, `P2`: script QA ở thư mục tạm bị mất.

<a id="gl-07"></a>
### GL-07 · Bàn giao — PHẢI
- **Tài liệu cho khách:**
  - hướng dẫn Studio (ngắn, có ảnh, không thuật ngữ);
  - danh sách nội dung khách cần tự hoàn thiện;
  - cách đọc GA4 (độ trễ, nguồn);
  - mã import GTM + bảng sự kiện;
  - thông tin liên hệ hỗ trợ.
- **Quyền:** Studio `editor` (Q-28) + cổng khách.
- **Báo cáo mỗi đợt / PR:** đã làm / đã kiểm / TODO cần thông tin thật / việc thủ công / cách rollback.
- Tài liệu thô của khách (feedback có dữ liệu cá nhân, ảnh gốc, tệp lớn) để **ngoài git** (`client-inputs/` trong `.gitignore` + `.vercelignore`).
- Báo cáo QA / audit / bàn giao thì commit vào `docs/`: để local-only sẽ mất khi merge.
- **Nguồn:** `P2` `docs/build-studio-guide.py`, `docs/gtm/*`; `P8` `docs/SEO_GEO_AEO_REPORT.md`; `P7` `docs/tracking.md`; `P2 0fe4e18`.
