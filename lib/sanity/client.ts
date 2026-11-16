import "server-only";
import { createClient, type SanityClient } from "next-sanity";
import { serverEnv } from "@/lib/env";

let client: SanityClient | undefined;

/**
 * Client đọc công khai: CDN + perspective "published" (Sanity gói Free).
 * Chỉ gọi khi cửa nội dung chạy chế độ "sanity"; làm mới nhờ cacheTag + webhook, không no-store.
 */
export function sanityClient(): SanityClient {
  if (client) return client;
  const { sanity } = serverEnv();
  if (!sanity.projectId) throw new Error("Thiếu NEXT_PUBLIC_SANITY_PROJECT_ID.");
  client = createClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    apiVersion: sanity.apiVersion,
    useCdn: true,
    perspective: "published",
    token: sanity.readToken,
  });
  return client;
}
