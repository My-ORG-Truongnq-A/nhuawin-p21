# Checklist nghiệm thu

Dùng theo mốc của pipeline `website-standard`. Mỗi dòng có mã luật để tra chi tiết.

**Cách đánh dấu:**
- `[x]` đạt, kèm bằng chứng (link, ảnh, output lệnh).
- `[~]` lệch chuẩn đã ghi ở `00-du-an.md`.
- `[-]` không áp dụng (vd. site không có blog).
- `[ ]` chưa đạt.

Còn dòng **PHẢI** chưa đạt thì không qua mốc. Dòng đánh **(NÊN)** không chặn.

## A. Trước khi code (G2 → G3)

- [ ] Hướng giao diện, phạm vi motion và mockup 1440 / 390 đã chốt ([GD-01](07-giao-dien.md#gd-01))
- [ ] `00-du-an.md` đã điền đủ:
  - NAP, pháp nhân, MST, hotline, Zalo;
  - đích lead, ngôn ngữ;
  - quyết định index và crawler AI;
  - ngành có điều kiện quảng cáo hay không; có bán hàng trực tuyến hay không ([BM-08](11-bao-mat-phap-ly.md#bm-08), [BM-09](11-bao-mat-phap-ly.md#bm-09))
- [ ] Bảng claim → nguồn đã lập; danh sách `missing_info` đã gửi khách ([ND-05](04-noi-dung-cms.md#nd-05))
- [ ] (Migration) Kiểm kê đủ URL cũ: sitemap, phân trang, GSC, Wayback, ảnh, đường dẫn admin ([SEO-09](02-seo.md#seo-09))
- [ ] (Migration) Kiểm kê tag / trigger tracking cũ ([TR-02](10-tracking.md#tr-02))
- [ ] Bảng sự kiện tracking đã chốt ([TR-03](10-tracking.md#tr-03))

## B. Trước preview gửi khách

### Kiến trúc & repo
- [ ] Repo sạch, test rào xanh ([KT-08](01-kien-truc.md#kt-08)); `.gitignore` / `.vercelignore` chuẩn ([KT-09](01-kien-truc.md#kt-09))
- [ ] Một cửa nội dung có seed ([KT-01](01-kien-truc.md#kt-01)); trang tĩnh, cache tag, webhook có chữ ký ([KT-02](01-kien-truc.md#kt-02)); route tự sinh có hạn làm mới ([KT-03](01-kien-truc.md#kt-03))
- [ ] `page.tsx` chỉ export hợp lệ ([KT-05](01-kien-truc.md#kt-05)); có `error.tsx` và `not-found.tsx` tiếng Việt ([KT-06](01-kien-truc.md#kt-06), [SEO-12](02-seo.md#seo-12))
- [ ] Next ghim bản vá, một lockfile ([KT-07](01-kien-truc.md#kt-07)); không còn route nháp / cấu hình thử ([KT-10](01-kien-truc.md#kt-10)); env đọc qua `lib/env.ts`, không fallback giá trị thật ([KT-11](01-kien-truc.md#kt-11))

### SEO
- [ ] Preview noindex hai lớp; `*.vercel.app` luôn noindex ([SEO-01](02-seo.md#seo-01)); `SITE_URL` một nguồn ([SEO-02](02-seo.md#seo-02)); một host chuẩn ([SEO-03](02-seo.md#seo-03))
- [ ] Builder metadata; title / description đúng độ dài ([SEO-04](02-seo.md#seo-04)); canonical cho mọi trang ([SEO-05](02-seo.md#seo-05))
- [ ] Sitemap sinh từ dữ liệu, lastmod thật, có escape ([SEO-06](02-seo.md#seo-06)); robots đúng ([SEO-07](02-seo.md#seo-07)); trang mỏng / lọc `noindex, follow` ([SEO-08](02-seo.md#seo-08))
- [ ] Mỗi trang 1 H1 ([SEO-10](02-seo.md#seo-10)); liên kết nội bộ theo chủ đề, có breadcrumb ([SEO-11](02-seo.md#seo-11)); slug tiếng Việt chuẩn ([SEO-13](02-seo.md#seo-13))
- [ ] OG JPEG 1200×630 ([SEO-14](02-seo.md#seo-14)); favicon một bộ ([SEO-15](02-seo.md#seo-15)); (đa ngôn ngữ) hreflang chỉ cho bản dịch thật ([SEO-16](02-seo.md#seo-16))
- [ ] (NÊN) Quyết định index trang sản phẩm nhất quán ([SEO-18](02-seo.md#seo-18))

### GEO
- [ ] Robots AI theo nhóm ([GEO-01](03-geo.md#geo-01)); `@graph` JSON-LD có escape, parse được, ảnh trả 200 ([GEO-02](03-geo.md#geo-02))
- [ ] NAP lấy từ `siteSettings`, không hard-code ([GEO-03](03-geo.md#geo-03)); không dữ liệu bịa trong schema / FAQ ([GEO-04](03-geo.md#geo-04))
- [ ] Trang trụ cột: answer-first, "Thông tin nhanh", ngày cập nhật ([GEO-05](03-geo.md#geo-05))
- [ ] (NÊN) `llms.txt` sinh từ nguồn dữ liệu, có test ([GEO-06](03-geo.md#geo-06)); một tệp facts ([GEO-07](03-geo.md#geo-07))

### Nội dung
- [ ] Mô hình Sanity chuẩn, ID Studio ASCII ([ND-01](04-noi-dung-cms.md#nd-01)); một khái niệm một nguồn ([ND-03](04-noi-dung-cms.md#nd-03)); mọi block có renderer ([ND-04](04-noi-dung-cms.md#nd-04))
- [ ] Ảnh master gốc, alt đúng, không có ảnh AI vẽ logo ([ND-06](04-noi-dung-cms.md#nd-06)); migrate / patch có dry-run và khoá `_rev` ([ND-07](04-noi-dung-cms.md#nd-07))
- [ ] (Có blog) ngày, tác giả, mục lục, RSS ([ND-08](04-noi-dung-cms.md#nd-08))
- [ ] (NÊN) Trường SEO có bộ đếm ([ND-02](04-noi-dung-cms.md#nd-02)); Studio preview, CORS ([ND-09](04-noi-dung-cms.md#nd-09))

### Hiệu năng
- [ ] Phần tử LCP hiển thị ngay từ HTML, có `fetchPriority="high"` ([HN-02](05-hieu-nang.md#hn-02)); loader ảnh, `sizes` đúng ([HN-03](05-hieu-nang.md#hn-03))
- [ ] Font ≤ 2 họ, preload ≤ 4 face ([HN-04](05-hieu-nang.md#hn-04)); script bên thứ ba nạp trễ, có facade ([HN-05](05-hieu-nang.md#hn-05)); không dùng thư viện motion nặng ([HN-06](05-hieu-nang.md#hn-06))
- [ ] Cache header đúng ([HN-08](05-hieu-nang.md#hn-08))
- [ ] Đạt **cổng chặn** Lighthouse mobile (trung vị 3 lượt), có báo cáo trước / sau ([HN-01](05-hieu-nang.md#hn-01), [QA-06](13-kiem-thu.md#qa-06))
- [ ] (NÊN) JS / HTML gọn ([HN-07](05-hieu-nang.md#hn-07))

### Mobile & giao diện
- [ ] Viewport, `formatDetection`, `browserslist` ([MB-01](06-mobile.md#mb-01)); không tràn ngang ([MB-02](06-mobile.md#mb-02)); chụp đủ 5 viewport ([QA-05](13-kiem-thu.md#qa-05))
- [ ] Thanh CTA đáy, không chồng widget ([MB-03](06-mobile.md#mb-03)); drawer dùng portal + `inert` ([MB-04](06-mobile.md#mb-04)); vùng chạm ≥ 24 px, CTA ≥ 44 px ([MB-05](06-mobile.md#mb-05))
- [ ] (B2B / sản phẩm) Bảng thông số thành thẻ trên mobile ([MB-07](06-mobile.md#mb-07))
- [ ] Token một tệp ([GD-02](07-giao-dien.md#gd-02)); chữ Việt đủ glyph ([GD-03](07-giao-dien.md#gd-03)); motion theo chuẩn ([GD-04](07-giao-dien.md#gd-04)); logo nguyên ảnh ([GD-06](07-giao-dien.md#gd-06))
- [ ] Ảnh 1440 / 390 đã được chấm độc lập ([GD-07](07-giao-dien.md#gd-07))
- [ ] (NÊN) Thiết kế riêng cho mobile ([MB-06](06-mobile.md#mb-06)); bàn phím ảo không che form ([MB-08](06-mobile.md#mb-08)); bộ component chuẩn ([GD-05](07-giao-dien.md#gd-05))

### Tiếp cận
- [ ] Skip link, landmark, focus-visible ([TC-01](08-tiep-can.md#tc-01)); form tiếp cận được ([TC-02](08-tiep-can.md#tc-02)); dialog / drawer dùng được bằng bàn phím ([TC-03](08-tiep-can.md#tc-03))
- [ ] Tương phản AA ([TC-04](08-tiep-can.md#tc-04)); slider có nút dừng ([TC-05](08-tiep-can.md#tc-05)); heading, bảng, link đúng cấu trúc ([TC-06](08-tiep-can.md#tc-06)); axe 0 lỗi serious / critical ([TC-07](08-tiep-can.md#tc-07))

### Lead & tracking
- [ ] Lưu xong mới báo thành công, thiếu env thì báo lỗi ([LD-01](09-lead.md#ld-01)); CRM gọi server-to-server ([LD-02](09-lead.md#ld-02)); form giữ dữ liệu khi lỗi ([LD-03](09-lead.md#ld-03))
- [ ] Chống spam, rate limit dùng store chung ([LD-04](09-lead.md#ld-04)); UTM / click ID đi theo lead ([LD-05](09-lead.md#ld-05)); SĐT / ngày theo VN ([LD-06](09-lead.md#ld-06))
- [ ] Lead lưu an toàn, query không token đếm được 0 lead ([LD-07](09-lead.md#ld-07)); CTA / kênh nhanh, một hotline chính ([LD-08](09-lead.md#ld-08))
- [ ] ID tracking từ env, cổng `VERCEL_ENV` ([TR-01](10-tracking.md#tr-01)); `generate_lead` chỉ sau `ok` ([TR-02](10-tracking.md#tr-02)); tên sự kiện chuẩn ([TR-03](10-tracking.md#tr-03)); không mất sự kiện khi điều hướng ([TR-04](10-tracking.md#tr-04))
- [ ] (NÊN) Chat widget dùng key riêng, popup có mốc nghỉ ([LD-09](09-lead.md#ld-09))

### Bảo mật & pháp lý
- [ ] Header bảo mật ([BM-01](11-bao-mat-phap-ly.md#bm-01)); secret sạch, deploy qua CI ([BM-03](11-bao-mat-phap-ly.md#bm-03)); webhook / cron / API công khai có kiểm ([BM-04](11-bao-mat-phap-ly.md#bm-04)); audit dependency ([BM-05](11-bao-mat-phap-ly.md#bm-05))
- [ ] Footer có thông tin doanh nghiệp và trang chính sách ([BM-06](11-bao-mat-phap-ly.md#bm-06)); ô đồng ý không tích sẵn, câu đồng ý có version ([BM-07](11-bao-mat-phap-ly.md#bm-07))
- [ ] (NÊN) CSP chạy Report-Only ([BM-02](11-bao-mat-phap-ly.md#bm-02))

### Kiểm thử
- [ ] Job CI `ci` xanh: lint · typecheck · test · build ([GL-06](12-go-live.md#gl-06), [QA-01](13-kiem-thu.md#qa-01), [QA-02](13-kiem-thu.md#qa-02))
- [ ] Review độc lập xong, mọi mục có bằng chứng; báo cáo đã commit vào `docs/` ([QA-07](13-kiem-thu.md#qa-07))

## C. Trước go-live (G6)

- [ ] Cổng chặn go-live: env đủ, không dùng seed, không còn `localhost`, ảnh / sitemap / robots trả 200 ([GL-02](12-go-live.md#gl-02))
- [ ] Văn bản chính sách và câu đồng ý đã được người phụ trách pháp lý duyệt ([BM-07](11-bao-mat-phap-ly.md#bm-07))
- [ ] (Ngành y tế / ngành có điều kiện) Đã có giấy phép và giấy xác nhận quảng cáo ([BM-08](11-bao-mat-phap-ly.md#bm-08)); (bán hàng trực tuyến) đã làm thủ tục thông báo ([BM-09](11-bao-mat-phap-ly.md#bm-09))
- [ ] Pixel quảng cáo chỉ chạy khi có đồng ý ([TR-05](10-tracking.md#tr-05))
- [ ] (Domain thật) Runbook T-3 / T / T+1h và điều kiện rollback ([GL-01](12-go-live.md#gl-01)); MX / SPF đã chép; thứ tự đổi domain ([GL-04](12-go-live.md#gl-04))
- [ ] `ALLOW_INDEXING` đúng quyết định, đã redeploy, đã kiểm HTML thật ([GL-03](12-go-live.md#gl-03))
- [ ] Quét sitemap + `check-urls` 0 lệch ([QA-03](13-kiem-thu.md#qa-03))
- [ ] Gửi form thật: lead vào CRM (người xác nhận), mail tới (nếu có), `generate_lead` hiện ở Realtime (nếu có GTM / GA4) ([LD-10](09-lead.md#ld-10), [TR-07](10-tracking.md#tr-07))

## D. Sau go-live

- [ ] T+1h: kiểm 10 điểm ([GL-01](12-go-live.md#gl-01)); dùng `curl` kiểm header / redirect / OG trên URL thật ([QA-04](13-kiem-thu.md#qa-04))
- [ ] (Domain riêng đã index) Search Console: xác minh, nộp sitemap ([SEO-17](02-seo.md#seo-17)); (NÊN) Bing + IndexNow
- [ ] Theo dõi 4 tuần: log 404 → thêm redirect, email GSC, CWV, số lead ([GL-05](12-go-live.md#gl-05))
- [ ] Bàn giao: hướng dẫn Studio, danh sách nội dung khách tự làm, file GTM import, cách đọc GA4 ([GL-07](12-go-live.md#gl-07))
- [ ] (NÊN) Hỏi thử AI theo bộ câu cố định, ghi kết quả ([GEO-08](03-geo.md#geo-08))
