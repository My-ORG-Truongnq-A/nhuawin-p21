import { expect, type Page } from "@playwright/test";

/** Mỗi trang: đúng 1 H1, canonical tuyệt đối, 1 khối JSON-LD có các @type yêu cầu. */
export async function expectSeo(page: Page, canonicalPath: string, types: string[]) {
  await expect(page.locator("h1")).toHaveCount(1);
  const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
  expect(canonical.pathname + canonical.search).toBe(canonicalPath);
  const ld = page.locator('script[type="application/ld+json"]');
  await expect(ld).toHaveCount(1);
  const graph = JSON.parse((await ld.textContent())!)["@graph"] as { "@type": string }[];
  for (const t of types) expect(graph.map((n) => n["@type"])).toContain(t);
}

export async function expectAnchorsOnce(page: Page, ids: string[]) {
  for (const id of ids) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
}
