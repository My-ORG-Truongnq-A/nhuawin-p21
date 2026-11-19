/**
 * Crawler AI theo mục đích (GEO-01). Mặc định cho phép cả ba nhóm; khách muốn chặn nhóm nào
 * (OQ-SEO-04) thì đổi `allow` ở đây và ghi vào docs/standards/00-du-an.md — không sửa logic.
 * Không dùng token cũ (Claude-Web, anthropic-ai).
 */
export type CrawlerGroup = {
  purpose: "search" | "user" | "training";
  note: string;
  agents: string[];
  allow: boolean;
};

export const AI_CRAWLERS: CrawlerGroup[] = [
  {
    purpose: "search",
    note: "Bot tìm kiếm AI: lập chỉ mục để trích dẫn trong câu trả lời",
    agents: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Bingbot"],
    allow: true,
  },
  {
    purpose: "user",
    note: "Bot truy cập thay người dùng đang hỏi (có thể bỏ qua robots — muốn chặn thật phải dùng WAF)",
    agents: ["ChatGPT-User", "Claude-User", "Perplexity-User"],
    allow: true,
  },
  {
    purpose: "training",
    note: "Bot / token huấn luyện mô hình",
    agents: ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Applebot-Extended", "Meta-ExternalAgent"],
    allow: true,
  },
];
