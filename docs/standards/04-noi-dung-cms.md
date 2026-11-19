# 04 · Nội dung & CMS (`ND`)

Mục tiêu:
- Biên tập viên của khách sửa được nội dung mà không làm vỡ layout hay SEO.
- Không có nội dung bịa.
- Nhập / sửa hàng loạt an toàn, không đốt quota Sanity Free.

<a id="nd-01"></a>
### ND-01 · Mô hình nội dung Sanity — PHẢI
- **Singleton** (ẩn khỏi "create new", chỉ publish / discard): `siteSettings` (NAP, hotline, Zalo, pháp nhân, `sameAs`, popup, giấy phép), trang chủ, các trang tĩnh.
- **Collection:** bài viết, dịch vụ, sản phẩm, dự án, FAQ, tác giả, danh mục, tag, `redirect` (khách tự thêm 301).
- **Object dùng lại:**
  - `seo`: title, description, ảnh, `noIndex`, `canonical`;
  - `imageWithAlt`: alt bắt buộc;
  - `faq`;
  - `leadForm`: các trường, mục đích, câu đồng ý.
- Chỉ cho biên tập **giá trị nội dung**; giá trị layout / class nằm trong code.
- Loại khác tính chất thì tách type riêng (`news` ≠ `post`).
- **ID cấu trúc Studio PHẢI là ASCII**, không lấy từ tiêu đề tiếng Việt; có test.
- Studio tiếng Việt (`@sanity/locale-vi-vn`), `basePath: "/studio"`.
- Ghim phiên bản `sanity` (6.17 làm list giật khi cuộn).
- **Nguồn:**
  - `P1 03e8eb3`: Studio hỏng 3 ngày vì ID có dấu.
  - `P3 edfb412`.
  - `P2 0e80ddd`.
  - `P1` `sanity/schemaTypes/*`.
  - `P7` `src/sanity/structure.ts`.

<a id="nd-02"></a>
### ND-02 · Trường SEO có bộ đếm và gợi ý tự điền — NÊN
- Object `seo` hiện bộ đếm: title 40–60, description 120–160.
- Khi để trống, Studio hiện gợi ý mờ đúng chuỗi mà site sẽ dùng: công thức trong `lib/*-seo.ts`, dùng chung cho site và Studio.
- Validation dùng `warning` cho độ dài; `error` cho `path` không khớp slug.
- Có mục "Bài cần hoàn thiện" (thiếu ảnh bìa / alt / mô tả).
- **Nguồn:** `P2 ff80b36`, `93a9512` (`seoAutoInput`); `P3 4e87b9f`; `P5` `postType.ts`.

<a id="nd-03"></a>
### ND-03 · Một khái niệm một nguồn; chống tham chiếu vòng — PHẢI
- Một danh sách cho một khái niệm. Ví dụ: "dự án nổi bật" dùng chung cho trang chủ và trang danh sách.
- Sắp xếp theo ngày, không theo id cũ.
- Phân trang khi build có thứ tự bất biến (`order(_createdAt asc, _id asc)`) và dedupe path.
- Validation chặn danh mục tự tham chiếu vòng. Breadcrumb dừng khi gặp vòng.
- Một trang KHÔNG ghép lâu dài từ hai nguồn (CMS + file Markdown).
- **Nguồn:**
  - `P2 4bde09b`.
  - `P2 f9bcd9b`: hub tin tức render 0 bài.
  - `P1 37031e1`.
  - `P3 90b559c`: sitemap quên nguồn Markdown, mất 9 bài.

<a id="nd-04"></a>
### ND-04 · Mọi block Portable Text có renderer + test — PHẢI
- Mỗi block / mark trong schema có renderer: `youtube { url, caption }`, bảng, ảnh có alt, danh sách có `level`, code. Có test render cho từng loại.
- Nội dung dán vào editor PHẢI qua bước chuẩn hoá:
  - iframe / link YouTube dán thành chữ → player;
  - `&nbsp;` thừa;
  - `????` do lỗi mã hoá MySQL utf8;
  - link chết.
- Bước chuẩn hoá này có test trên **output thật của nguồn**.
- Chặn HTML thô lọt vào JSON-LD (`acceptedAnswer`).
- **Blog tương thích DigiAgent** (Q-38): type `post` có `title`, `slug`, `body`, `excerpt`, `mainImage`, `publishedAt`, `language`, `category` / `tag` (reference). Renderer đọc được `@sanity/table` và block `youtube`.
- **Nguồn:** `P2 f049f68`: block youtube biến mất; `P1 075d50b`, `adb900d`, `ff70952`; `P3 f4e7914`.

<a id="nd-05"></a>
### ND-05 · Không bịa nội dung, claim phải có nguồn — PHẢI
- KHÔNG tự viết số liệu, giá, thông số kỹ thuật, mã hàng, chính sách, giấy phép, chứng nhận, danh hiệu, số khách hàng, lời hứa.
  - Ví dụ đã từng phải gỡ: "hàng đầu", "công nghệ Đức / Nhật", "FDA", "300+ doanh nghiệp", "1.000.000+ sản phẩm / tháng", "an toàn tuyệt đối", "không đau", "vĩnh viễn".
- Thiếu thông tin thì để **placeholder `missing_info`**, liệt kê ở mục "Cần khách xác nhận" trong `00-du-an.md` (hoặc README của repo). Không ghi chú trong chat.
- Trước khi viết copy, lập **bảng claim** gồm: câu | nguồn / chứng cứ | xử lý (giữ / viết định tính / bỏ).
- Văn bản pháp lý chỉ mô tả tính năng **đã có thật**. Đánh dấu cần người duyệt (Q-19).
- Ưu đãi / giá có `startDate` / `endDate` trong CMS, tự ẩn khi hết hạn (giờ VN). Bảng giá, dịch vụ và FAQ dùng một nguồn giá.
- **Kiểm:** người duyệt đối chiếu bảng claim trước G4; grep các từ cần soát ("tuyệt đối", "hàng đầu", "100%", "FDA", "vĩnh viễn", "không đau") trong nội dung.
- **Nguồn:**
  - `P5 45bc50c`, `8fc3f55` (bảng claim trong `brand-dna-asset-inventory.md`).
  - `P6 c720e6f`.
  - `P7` (Excel của khách là nguồn, AI từng bịa mã hàng / dung sai).
  - `P3 70e3493`.
  - `P6 WEB-08`: ưu đãi hết hạn vẫn hiện.
  - `P8` `TODO(nội dung)`.

<a id="nd-06"></a>
### ND-06 · Ảnh: master gốc, alt đúng, không nhầm — PHẢI
- **Ảnh gốc** của khách giữ nguyên, KHÔNG thu nhỏ hay nén lại khi clone / nhập. Biến thể 480 / 960 / 1440 tạo riêng. Icon / logo nén **lossless**.
- **Alt:**
  - mọi ảnh nội dung có alt mô tả đúng ảnh; ảnh trang trí dùng `alt=""` tường minh;
  - alt lấy từ CMS và được ưu tiên hơn alt dự phòng;
  - không điền alt bằng chính tiêu đề cho mọi ảnh.
- Ảnh khớp nội dung (không gắn nhầm máy / dịch vụ). Chưa rõ model thì đặt tên trung tính và không ghi model trong alt.
- Ảnh trong bài có asset thật; bỏ ảnh hot-link chết.
- **Ảnh AI:** chỉ là tạm thời, có người duyệt, KHÔNG để model vẽ logo / biển hiệu (ghép logo master bằng code), không có người nhận diện được. KHÔNG sinh ảnh trước khi chốt art direction.
- Ảnh khách gửi PHẢI che SĐT / dữ liệu cá nhân, rà bằng OCR.
- Quy trình ảnh chi tiết: skill `image-pipeline`.
- **Nguồn:**
  - `P1 1108f93`, `24c9809`: phải tải lại 12.408 ảnh.
  - `P2 S4`: 5.066 / 9.862 ảnh không có alt.
  - `P6 8fefc75`.
  - `P7 1d2243d`: logo sai trong ảnh AI.
  - `P3 5e3381b`.
  - `P1 98a7a4e`, `cb13478`: ảnh "đã che" vẫn lộ SĐT.

<a id="nd-07"></a>
### ND-07 · Migrate / sửa hàng loạt an toàn — PHẢI
- Script trong `scripts/sanity/`, mặc định **dry-run**; `--apply` mới ghi, có backup / snapshot và `--revert`.
- Tách **kế hoạch thuần** (hàm trả `{ patches, ok, manual }`, có test) khỏi bước ghi.
- Chỉ đổi trường còn là giá trị seed cũ hoặc đang trống. Trường khách đã sửa thì đưa vào danh sách "xem tay".
- Mỗi patch khoá `ifRevisionId(_rev)`, gom trong một `transaction`. KHÔNG `createOrReplace`. Đọc lại để xác minh sau khi ghi.
- Migrate idempotent (`createIfNotExists`), bỏ qua document đã sửa trong Studio trừ khi có `--force`.
- **Đổi tên / thêm trường bắt buộc** thì kèm backfill trong cùng đợt.
- Markdown → Portable Text: script có kiểm độ khớp (text / bảng / heading / link khớp bản gốc), `--draft` ghi bản nháp.
- **Quota Sanity Free:** đếm số document trước khi migrate (giới hạn 10.000); đọc qua CDN; ghi theo lô; KHÔNG có test / script gọi Sanity lặp (bất biến 10). Test chạy trên seed.
- Dữ liệu bên thứ ba trả thiếu (vd. review chỉ 5 bản ghi mỗi lượt) thì KHÔNG dùng làm căn cứ xoá.
- **Nguồn:**
  - `P7` `patch-feedback-*.mts` (khoá `_rev`).
  - `P2` `scripts/sanity/*` (`--revert`).
  - `P8 7cadb78`: đổi tên trường làm mất dữ liệu.
  - `P3` `md-to-sanity.mjs`.
  - `P1 18bb5a9`.
  - `P2` TASKS #2.

<a id="nd-08"></a>
### ND-08 · Blog chuẩn — PHẢI (nếu có blog)
- Mỗi bài có ngày đăng và ngày cập nhật thật, `readingTime` tự tính.
- Có mục lục (heading có id), tác giả (hoặc Organization), ảnh bìa crop theo focal point ra 1200×630.
- Có ít nhất 1 link tới dịch vụ / chuyên mục cha, và "bài liên quan" theo [SEO-11](02-seo.md#seo-11).
- `BlogPosting` luôn có `image`. Thứ tự fallback: ảnh bìa → ảnh đầu bài → ảnh share mặc định.
- Bài trùng title / excerpt thì phân biệt (thêm ngày); bài chép nguồn ngoài thì canonical về nguồn hoặc `noindex`.
- Có RSS (`app/rss.xml/route.ts`), không ghi `enclosure length=0` bừa.
- **Nguồn:** `P1 3f4d748`, `36a3b0d`; `P3` schema `post`; `P2`.

<a id="nd-09"></a>
### ND-09 · Studio: preview, bàn giao, quyền — NÊN
- **Preview:** Draft Mode dùng token Viewer. Site ẩn header / footer / popup / widget khi đang ở `/studio`. Live Content API chỉ dùng cho preview.
- **CORS** Sanity khai đủ: localhost, preview, apex, www. Bật credentials. Đổi domain chính thì cập nhật lại.
- **Bàn giao** hướng dẫn Studio ngắn, không thuật ngữ, có ảnh (.docx từ Markdown), kèm danh sách nội dung khách phải tự hoàn thiện.
- **Nguồn:** `P3 4e87b9f`; `P8`: CORS lệch www / apex; `P2` `docs/build-studio-guide.py`; `P1` `studio-content-fixes`.
