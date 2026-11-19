import { expect, test } from "@playwright/test";
import { expectSeo } from "./helpers";

test.describe("/bao-gia (T4.3)", () => {
  for (const g of ["fomex-3-ly", "fomex-5-ly", "fomex-8-10-ly", "fomex-15-18-ly"]) {
    test(`?loai=${g} → 200, chọn sẵn, canonical /bao-gia`, async ({ page }) => {
      const res = await page.goto(`/bao-gia?loai=${g}#chon-quy-cach`);
      expect(res?.status()).toBe(200);
      await expect(page.locator(`#chon-quy-cach input[value="${g}"]`)).toBeChecked();
      await expectSeo(page, "/bao-gia", ["BreadcrumbList", "FAQPage", "LocalBusiness"]);
    });
  }

  test("?loai= lạ → form bình thường, không chọn sẵn", async ({ page }) => {
    const res = await page.goto("/bao-gia?loai=khong-co");
    expect(res?.status()).toBe(200);
    await expect(page.locator("#chon-quy-cach input[type=radio]")).toHaveCount(4);
    await expect(page.locator("#chon-quy-cach input:checked")).toHaveCount(0);
  });

  test("gửi thiếu trường → lỗi cạnh trường, giữ dữ liệu đã nhập", async ({ page }) => {
    await page.goto("/bao-gia?loai=fomex-5-ly");
    await page.getByLabel("Họ và tên *").fill("Khách thử");
    await page.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
    await expect(page.getByText("Vui lòng nhập số điện thoại.")).toBeVisible();
    await expect(page.getByLabel("Họ và tên *")).toHaveValue("Khách thử");
  });
});
