import { describe, expect, it } from "vitest";
import { SEED, SEED_POSTS } from "@/seed/content";
import { blogPostingNode, faqNode, plainText, productListNodes } from "./nodes";

const SITE = "https://nhuawin-p21.vercel.app";

describe("node JSON-LD theo template (REQ-26)", () => {
  it("FAQPage khớp 100% câu hỏi / trả lời hiển thị; không có FAQ → không node", () => {
    const faq = SEED.productsPage.faq!;
    const [node] = faqNode(faq, `${SITE}/san-pham`) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }[];
    expect(node.mainEntity.map((q) => q.name)).toEqual(faq.items.map((i) => i.question));
    expect(node.mainEntity[0].acceptedAnswer.text).toBe(plainText(faq.items[0].answer));
    expect(faqNode(undefined, SITE)).toEqual([]);
  });

  it("Product: không có offers / giá; URL anchor tuyệt đối; nhà sản xuất nối @id", () => {
    const [list] = productListNodes(SEED.productGroups, SITE, "WIN") as { itemListElement: { item: Record<string, unknown> }[] }[];
    expect(list.itemListElement).toHaveLength(4);
    const item = list.itemListElement[0].item;
    expect(item.url).toBe(`${SITE}/san-pham#fomex-3-ly`);
    expect(item.manufacturer).toEqual({ "@id": `${SITE}/#organization` });
    expect(JSON.stringify(list)).not.toMatch(/offers|price/i);
  });

  it("BlogPosting giữ ngày đăng web cũ, ảnh tuyệt đối, chủ đề", () => {
    const post = SEED_POSTS[0];
    const [n] = blogPostingNode(post, SITE) as Record<string, unknown>[];
    expect(n).toMatchObject({ headline: post.title, datePublished: post.publishedAt, articleSection: post.category?.title });
    expect(String(n.image)).toMatch(/^https:\/\//);
  });
});
