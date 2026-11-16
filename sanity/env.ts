/**
 * Cấu hình Studio (chạy phía trình duyệt). Chỉ đọc biến NEXT_PUBLIC_*; không token.
 * Thiếu projectId (build seed) → Studio báo cần cấu hình, site công khai vẫn chạy bằng seed.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "chua-cau-hinh";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";
export const STUDIO_TITLE = "Nhựa WIN Việt Nam — Quản trị nội dung";
