import { expect, test } from "@playwright/test";
import { expectSeo } from "./helpers";

const TOPICS = ["kien-thuc-vat-lieu", "tin-win", "chon-gia-cong", "danh-cho-dai-ly"];

test.describe("/tin-tuc (T4.6)", () => {
  test("danh sách: canonical bỏ utm, #danh-sach, 6 bài", async ({ page }) => {
    await page.goto("/tin-tuc?utm_source=x");
    await expectSeo(page, "/tin-tuc", ["CollectionPage", "BreadcrumbList"]);
    await expect(page.locator("#danh-sach")).toHaveCount(1);
    await expect(page.locator('#danh-sach ul.grid a[href^="/tin-tuc/"]')).toHaveCount(6);
  });

  for (const t of TOPICS) {
    test(`?chu-de=${t} → 200, noindex, canonical tự trỏ`, async ({ page }) => {
      const res = await page.goto(`/tin-tuc?chu-de=${t}&utm_medium=a`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
      const c = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
      expect(c.pathname + c.search).toBe(`/tin-tuc?chu-de=${t}`);
    });
  }

  test("trang vượt số trang → nội dung không tìm thấy + noindex", async ({ page }) => {
    await page.goto("/tin-tuc?trang=99");
    await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  });
});

test.describe("/tin-tuc/[slug] (T4.7)", () => {
  test("bài cũ 200, BlogPosting, bài liên quan, CTA → /bao-gia", async ({ page }) => {
    const res = await page.goto("/tin-tuc/tam-fomex-la-gi");
    expect(res?.status()).toBe(200);
    await expectSeo(page, "/tin-tuc/tam-fomex-la-gi", ["BlogPosting", "BreadcrumbList", "LocalBusiness"]);
    await expect(page.locator("h1")).toHaveText("Tấm Fomex là gì? Cấu tạo, đặc tính và ứng dụng");
    await expect(page.locator('[aria-labelledby="related-title"] a[href^="/tin-tuc/"]')).toHaveCount(3);
    await expect(page.locator('[aria-labelledby="article-cta"] a[href="/bao-gia"]')).toHaveCount(1);
  });

  test("slug không tồn tại → 404, không redirect", async ({ page }) => {
    const res = await page.goto("/tin-tuc/khong-ton-tai-xyz");
    expect(res?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe("/tin-tuc/khong-ton-tai-xyz");
  });
});
