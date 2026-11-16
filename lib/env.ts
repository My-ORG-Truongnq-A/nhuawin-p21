import "server-only";
import { z } from "zod";

/**
 * Biến môi trường phía server (KT-11). Token chỉ đọc được ở server (`server-only`).
 * Host / index đọc qua `lib/site-url.ts` và `lib/indexing.ts` (không import module này).
 */

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const schema = z.object({
  VERCEL_ENV: optional,
  SANITY_SOURCE: optional.pipe(z.enum(["seed", "sanity"]).optional()),
  /** Tên trong build_plan (DATA_SOURCE=fixtures|sanity); tương đương SANITY_SOURCE. */
  DATA_SOURCE: optional.pipe(z.enum(["fixtures", "sanity"]).optional()),
  NEXT_PUBLIC_SANITY_PROJECT_ID: optional.pipe(
    z.string().regex(/^[a-z0-9-]+$/, "chỉ gồm a-z, 0-9, '-'").optional(),
  ),
  NEXT_PUBLIC_SANITY_DATASET: optional.transform((v) => v ?? "production"),
  NEXT_PUBLIC_SANITY_API_VERSION: optional.transform((v) => v ?? "2026-11-01"),
  SANITY_API_READ_TOKEN: optional,
  SANITY_REVALIDATE_SECRET: optional,
  LEAD_DESTINATION: optional.pipe(z.enum(["digiagent_crm", "sanity_gmail"]).optional()),
  NEXT_PUBLIC_GTM_ID: optional,
  NEXT_PUBLIC_GA_ID: optional,
  GOOGLE_SITE_VERIFICATION: optional,
});

export type ContentSource = "seed" | "sanity";

export function parseServerEnv(raw: Record<string, string | undefined>) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Biến môi trường không hợp lệ — ${detail}`);
  }
  const e = parsed.data;
  const production = e.VERCEL_ENV === "production";
  const forcedSeed = e.SANITY_SOURCE === "seed" || e.DATA_SOURCE === "fixtures";

  if (production && forcedSeed) {
    throw new Error("Production không được chạy bằng seed (SANITY_SOURCE=seed / DATA_SOURCE=fixtures) — GL-02.");
  }
  if (production && !e.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error("Production thiếu NEXT_PUBLIC_SANITY_PROJECT_ID — cửa nội dung không được rơi về seed.");
  }

  const contentSource: ContentSource = forcedSeed || !e.NEXT_PUBLIC_SANITY_PROJECT_ID ? "seed" : "sanity";

  return {
    production,
    contentSource,
    sanity: {
      projectId: e.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: e.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: e.NEXT_PUBLIC_SANITY_API_VERSION,
      readToken: e.SANITY_API_READ_TOKEN,
      revalidateSecret: e.SANITY_REVALIDATE_SECRET,
    },
    leadDestination: e.LEAD_DESTINATION,
    tracking: {
      gtmId: e.NEXT_PUBLIC_GTM_ID,
      gaId: e.NEXT_PUBLIC_GA_ID,
      googleSiteVerification: e.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export type ServerEnv = ReturnType<typeof parseServerEnv>;

let cached: ServerEnv | undefined;
/** Đọc một lần mỗi process (giá trị env không đổi trong process). */
export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv({
    VERCEL_ENV: process.env.VERCEL_ENV,
    SANITY_SOURCE: process.env.SANITY_SOURCE,
    DATA_SOURCE: process.env.DATA_SOURCE,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    LEAD_DESTINATION: process.env.LEAD_DESTINATION,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  });
  return cached;
}
