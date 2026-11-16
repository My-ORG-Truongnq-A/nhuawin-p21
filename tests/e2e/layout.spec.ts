import { expect, test } from "@playwright/test";

test.describe("khung trang (T1.2, T1.3, T1.5, T4.10)", () => {
  test('mọi trang có <html lang="vi">, skip link là phần tử focus đầu tiên', async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Bỏ qua tới nội dung" })).toBeFocused();
  });

  test("nút Nhận báo giá luôn thấy trên thanh trên", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Nhận báo giá" })).toBeVisible();
  });

  test("cụm nút liên hệ nổi có nhãn tiếng Việt, Gọi trỏ tel:", async ({ page }) => {
    await page.goto("/");
    const call = page.getByRole("link", { name: /^Gọi hotline/ });
    await expect(call).toBeVisible();
    await expect(call).toHaveAttribute("href", /^tel:\+?\d+$/);
    await expect(page.getByRole("link", { name: "Nhắn Zalo" }).last()).toBeVisible();
  });

  for (const path of ["/khong-ton-tai-abc", "/en"]) {
    test(`${path} trả 404 tiếng Việt, có header/footer, noindex, không JSON-LD`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
      for (const href of ["/", "/san-pham", "/bao-gia", "/lien-he"]) {
        await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
      }
    });
  }

  test("menu mobile: mở bằng nút, Esc đóng và trả focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "chỉ ở 390 px");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Mở menu" });
    await toggle.click();
    await expect(page.locator("#menu-mobile")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#menu-mobile")).toBeHidden();
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeFocused();
  });

  test("menu con desktop: Enter mở, Esc đóng và trả focus về nút mở", async ({ page, isMobile }) => {
    test.skip(isMobile, "chỉ ở desktop");
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Mở menu con Sản phẩm" });
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(btn).toBeFocused();
  });

  test("/studio không dùng layout site", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("link", { name: "Bỏ qua tới nội dung" })).toHaveCount(0);
    await expect(page.locator('aside[aria-label="Liên hệ nhanh"]')).toHaveCount(0);
  });
});
