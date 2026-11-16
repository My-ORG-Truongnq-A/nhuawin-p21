import { expect, test } from "@playwright/test";
import { expectAnchorsOnce, expectSeo } from "./helpers";

test("/ve-win (T4.4): #nang-luc, #nha-may, 6 công đoạn, không claim chưa xác minh, thông tin nhanh", async ({ page }) => {
  await page.goto("/ve-win");
  await expectSeo(page, "/ve-win", ["AboutPage", "BreadcrumbList", "LocalBusiness"]);
  await expectAnchorsOnce(page, ["nang-luc", "nha-may"]);
  await expect(page.locator("#nha-may ol > li")).toHaveCount(6);
  await expect(page.locator("main")).not.toContainText("2 triệu");
  await expect(page.getByRole("complementary", { name: "Thông tin nhanh" })).toBeVisible();
  expect((await page.title()).length).toBeLessThanOrEqual(60);
});

test("/hop-tac (T4.5): 3 nhóm, 4 lợi ích, 4 bước, nút → #dang-ky, không MOQ", async ({ page }) => {
  await page.goto("/hop-tac");
  await expectSeo(page, "/hop-tac", ["BreadcrumbList", "FAQPage", "LocalBusiness"]);
  await expectAnchorsOnce(page, ["doi-tuong", "dang-ky"]);
  await expect(page.locator("#dong-hanh ul.flex > li")).toHaveCount(3);
  await expect(page.locator("#dong-hanh ul.grid > li")).toHaveCount(4);
  await expect(page.locator("#dong-hanh ol > li")).toHaveCount(4);
  await expect(page.locator('#dong-hanh a[href="/hop-tac#dang-ky"]')).toHaveCount(1);
  await expect(page.locator("main")).not.toContainText("MOQ");
  await expect(page.locator("#dang-ky form")).toHaveCount(1);
});

test("/lien-he (T4.8): NAP từ CMS, chưa có link nhúng → Mở Google Maps, không iframe", async ({ page }) => {
  await page.goto("/lien-he");
  await expectSeo(page, "/lien-he", ["ContactPage", "LocalBusiness"]);
  await expectAnchorsOnce(page, ["lien-he"]);
  await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible();
  await expect(page.locator("main iframe")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Mở Google Maps" })).toHaveAttribute("href", /^https:\/\/maps\./);
  await expect(page.getByRole("complementary", { name: "Thông tin nhanh" })).toBeVisible();
});

test("/chinh-sach-bao-mat (T4.9): chưa publish → 404, không vào sitemap", async ({ page, request }) => {
  const res = await page.goto("/chinh-sach-bao-mat");
  expect(res?.status()).toBe(404);
  const xml = await (await request.get("/sitemaps/pages.xml")).text();
  expect(xml).not.toContain("/chinh-sach-bao-mat");
  expect(xml).toContain("/san-pham</loc>");
});
