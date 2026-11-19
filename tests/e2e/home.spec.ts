import { expect, test } from "@playwright/test";
import { expectAnchorsOnce, expectSeo } from "./helpers";

test.describe("trang chủ (T4.1)", () => {
  test("đủ khối, link đúng đích, H1, JSON-LD WebSite + LocalBusiness", async ({ page }) => {
    await page.goto("/");
    await expectSeo(page, "/", ["WebSite", "LocalBusiness"]);
    await expectAnchorsOnce(page, ["top"]);
    await expect(page.locator("h1")).toContainText("Làm chủ công nghệ. Chủ động nguồn Fomex Việt.");
    await expect(page.locator('main a[href="/bao-gia"]').first()).toBeVisible();
    await expect(page.locator('#san-pham a[href^="/san-pham#fomex-"]')).toHaveCount(4);
    await expect(page.locator('#ung-dung a[href^="/san-pham#ung-dung-"]')).toHaveCount(7);
    await expect(page.locator('#hop-tac a[href="/hop-tac#dang-ky"]')).toHaveCount(1);
    await expect(page.locator('#kien-thuc ul a[href^="/tin-tuc/"]')).toHaveCount(3);
    await expect(page.locator("#lien-he form")).toHaveCount(1);
  });

  test("thông tin nhanh 5 dòng render ở server (tắt JS vẫn đọc được)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const facts = page.getByRole("complementary", { name: "Thông tin nhanh" });
    await expect(facts.locator("dt")).toHaveText(["Ai", "Làm gì", "Ở đâu", "Cho ai", "Liên hệ"]);
    await ctx.close();
  });

  test("ảnh hero là LCP: ưu tiên cao, không lazy", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby=hero-title] img").first();
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(hero).not.toHaveAttribute("loading", "lazy");
  });
});
