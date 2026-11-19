import { expect, type Page, test } from "@playwright/test";

/**
 * Form lead + đo lường (T5.3, T5.4; LD-01, LD-03, LD-04, LD-05, TR-01, TR-02).
 * Server e2e chạy LEADS_DRY_RUN=1 (playwright.config.ts) → không gửi lead thật, không gọi CRM.
 * Build e2e không phải production → không nhúng GTM / GA4 dù có ID.
 */

const leadEvents = (page: Page) =>
  page.evaluate(() => ((window.dataLayer ?? []) as { event?: string }[]).filter((e) => e.event === "generate_lead"));

async function fillContact(page: Page) {
  const form = page.locator("form", { has: page.getByLabel("Họ và tên *") }).first();
  await form.getByLabel("Họ và tên *").fill("Khách thử e2e");
  await form.getByLabel("Số điện thoại *").fill("0900 000 001");
  await form.getByLabel("Bạn là *").selectOption({ index: 1 });
  await form.getByLabel("Bạn cần *").selectOption({ index: 1 });
  return form;
}

test.describe("form liên hệ (/lien-he)", () => {
  test("gửi hợp lệ → thông báo tại chỗ, generate_lead đúng 1 lần, không PII", async ({ page }) => {
    await page.goto("/lien-he");
    const form = await fillContact(page);
    // Người thật cần ≥ 2 s để điền (LD-04); dưới ngưỡng server coi là bot.
    await page.waitForTimeout(2100);
    await form.getByRole("button").click();
    await expect(page.getByRole("status").filter({ hasText: /\S/ })).toBeVisible();
    await expect(page).toHaveURL(/\/lien-he$/);
    await expect.poll(() => leadEvents(page)).toHaveLength(1);
    const [ev] = await leadEvents(page);
    expect(ev).toEqual({ event: "generate_lead", form_name: "contact_form", form_type: "contact", page_path: "/lien-he" });
    expect(JSON.stringify(ev)).not.toMatch(/Khách|0900/);
  });

  test("SĐT sai → lỗi cạnh ô, focus vào ô lỗi, giữ dữ liệu, không generate_lead", async ({ page }) => {
    await page.goto("/lien-he");
    const form = await fillContact(page);
    await form.getByLabel("Số điện thoại *").fill("12345");
    await form.getByRole("button").click();
    const phone = form.getByLabel("Số điện thoại *");
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await expect(phone).toBeFocused();
    await expect(page.getByText("Số điện thoại chưa đúng (vd 09xx xxx xxx).")).toBeVisible();
    await expect(form.getByLabel("Họ và tên *")).toHaveValue("Khách thử e2e");
    await expect(form.getByLabel("Bạn cần *")).not.toHaveValue("");
    expect(await leadEvents(page)).toHaveLength(0);
  });

  test("bot điền honeypot → không đếm chuyển đổi", async ({ page }) => {
    await page.goto("/lien-he");
    const form = await fillContact(page);
    await form.locator('input[name="website"]').evaluate((el: HTMLInputElement) => (el.value = "http://spam.example"));
    await page.waitForTimeout(2100);
    await form.getByRole("button").click();
    await expect(page.getByRole("status").filter({ hasText: /\S/ })).toBeVisible();
    expect(await leadEvents(page)).toHaveLength(0);
  });
});

test.describe("nguồn lead (LD-05)", () => {
  const cookie = async (page: Page, name: string) =>
    (await page.context().cookies()).find((c) => c.name === name);

  test("first-touch giữ lượt đầu; last non-direct thay cả bộ khi có UTM mới", async ({ page }) => {
    await page.goto("/?utm_source=google&utm_campaign=fomex&utm_term=tam-fomex");
    await expect.poll(() => cookie(page, "lead_lt")).toBeDefined();
    await page.goto("/bao-gia?utm_source=zalo");
    await expect.poll(async () => decodeURIComponent((await cookie(page, "lead_lt"))?.value ?? "")).toContain('"utm_source":"zalo"');

    const ft = JSON.parse(decodeURIComponent((await cookie(page, "lead_ft"))!.value));
    const lt = JSON.parse(decodeURIComponent((await cookie(page, "lead_lt"))!.value));
    expect(ft).toMatchObject({ utm_source: "google", utm_campaign: "fomex", landing: "/" });
    expect(lt).toMatchObject({ utm_source: "zalo", landing: "/bao-gia" });
    expect(lt.utm_term).toBeUndefined();
    expect((await cookie(page, "lead_lt"))?.sameSite).toBe("Lax");
  });
});

test("không phải production → 0 thẻ script đo lường (TR-01)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('script[src*="googletagmanager.com"], #tracking-queue')).toHaveCount(0);
});

test.describe("dry-run + nhấp đúp (LD-01)", () => {
  for (const [kind, path] of [
    ["quote", "/bao-gia"],
    ["partnership", "/hop-tac"],
    ["contact", "/lien-he"],
  ] as const) {
    test(`${kind} ở ${path}: nhấp đúp → 1 request, thành công kèm dòng "Bản demo"`, async ({ page }) => {
      await page.goto(path);
      const form = page.locator(`form:has(input[name="$kind"][value="${kind}"])`);
      await form.locator('input[name="name"]').fill("Khách thử e2e");
      await form.locator('input[name="phone"]').fill("0900 000 001");
      const province = form.locator('input[name="province"]');
      if (await province.count()) await province.fill("Huế");
      for (const sel of await form.locator("select").all()) await sel.selectOption({ index: 1 });
      const radio = form.locator('input[type="radio"]').first();
      if ((await radio.count()) && !(await form.locator('input[type="radio"]:checked').count())) await radio.check();

      const posts: string[] = [];
      page.on("request", (r) => {
        if (r.method() === "POST" && r.headers()["next-action"]) posts.push(r.url());
      });
      await page.waitForTimeout(2100);
      await form.getByRole("button", { name: /\S/ }).last().dblclick();

      const status = page.getByRole("status").filter({ hasText: /\S/ });
      await expect(status).toBeVisible();
      await expect(status).toContainText("Bản demo — thông tin chưa được gửi tới doanh nghiệp");
      await page.waitForTimeout(500);
      expect(posts).toHaveLength(1);
      await expect.poll(() => leadEvents(page)).toHaveLength(1);
    });
  }
});
