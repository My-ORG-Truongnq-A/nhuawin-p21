import { expect, test } from "@playwright/test";

/** Trang trong ma trận QA responsive (launch.responsive). */
const PAGES = ["/", "/ve-win", "/bao-gia", "/hop-tac", "/lien-he", "/tin-tuc", "/san-pham", "/tin-tuc/nhap-fomex-so-luong-lon-cho-dai-ly"];

test.describe("vùng chạm & lớp cố định (MB-05, MB-03)", () => {
  for (const path of PAGES) {
    test(`${path}: link / nút ≥ 44×44 px ở mobile`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "chỉ ở 390 px");
      await page.goto(path);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("a[href], button, [role='button']")) {
          // Miễn trừ (MB-05): link nằm trong đoạn văn / dòng chữ.
          if (el.closest("p, .prose")) continue;
          const parentText = [...(el.parentElement?.childNodes ?? [])].some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim().replace(/^[·|/]$/, "") !== "",
          );
          if (parentText) continue;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          if (r.width === 0 || r.height === 0 || s.visibility === "hidden" || s.display === "none") continue;
          // Ngoài trang (skip link khi chưa focus) → không phải vùng chạm.
          if (r.bottom + scrollY <= 0 || r.right <= 0) continue;
          if (Math.round(r.width) < 44 || Math.round(r.height) < 44) {
            out.push(`${el.textContent?.trim() || el.getAttribute("aria-label")} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
        return out;
      });
      expect(small).toEqual([]);
      // Nới vùng chạm không được làm tràn ngang (MB-02).
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  }

  test("skip link không bị header dính che, khi focus nằm trên cùng", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Bỏ qua tới nội dung" });
    const hitBefore = await link.evaluate((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0) return "offscreen";
      return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el ? "self" : "covered";
    });
    expect(hitBefore).not.toBe("covered");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    // Chờ hết transition trượt xuống rồi mới đo điểm chạm.
    await expect
      .poll(() =>
        link.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el;
        }),
      )
      .toBe(true);
  });
});
