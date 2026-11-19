import { expect, test } from "@playwright/test";
import { expectAnchorsOnce, expectSeo } from "./helpers";

const APPS = ["bang-quang-cao-in-uv", "chu-noi-logo-khoi", "noi-that-vach-trang-tri", "backdrop-sinh-nhat", "backdrop-su-kien", "cat-dan-decal", "hashtag-check-in"];
const GROUPS = ["fomex-3-ly", "fomex-5-ly", "fomex-8-10-ly", "fomex-15-18-ly"];

test.describe("/san-pham (T4.2)", () => {
  test("13 anchor đúng 1 lần; nút báo giá theo nhóm; JSON-LD", async ({ page }) => {
    await page.goto("/san-pham");
    await expectSeo(page, "/san-pham", ["BreadcrumbList", "ItemList", "FAQPage", "LocalBusiness"]);
    await expectAnchorsOnce(page, [...GROUPS, "bang-quy-cach", "ung-dung", ...APPS.map((a) => `ung-dung-${a}`)]);
    for (const g of GROUPS) await expect(page.locator(`[id="${g}"] a[href="/bao-gia?loai=${g}#chon-quy-cach"]`)).toHaveCount(1);
  });

  test("bảng quy cách 14 dòng có trong HTML server (tắt JS)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/san-pham");
    await expect(page.locator("#bang-quy-cach table tbody th[scope=row]")).toHaveCount(14);
    await ctx.close();
  });

  test("album: mở bằng chuột, Esc đóng + trả focus, Enter mở lại", async ({ page }) => {
    await page.goto("/san-pham#ung-dung-backdrop-su-kien");
    const btn = page.locator("#ung-dung-backdrop-su-kien-nut");
    const panel = page.locator("#ung-dung-backdrop-su-kien-noi-dung");
    await expect(panel).toBeHidden();
    await btn.click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(panel.locator("img").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(btn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();
  });
});
