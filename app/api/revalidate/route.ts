import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { serverEnv } from "@/lib/env";
import { planRevalidation, type WebhookBody } from "@/lib/sanity/revalidate";

/**
 * Webhook Sanity → làm mới cache theo tag loại nội dung + path vừa publish (T3.7, KT-02).
 * Thiếu secret → 500 (không bỏ qua kiểm chữ ký); chữ ký sai → 401.
 */
export async function POST(req: NextRequest) {
  const secret = serverEnv().sanity.revalidateSecret;
  if (!secret) return Response.json({ message: "Thiếu SANITY_REVALIDATE_SECRET" }, { status: 500 });

  const { isValidSignature, body } = await parseBody<WebhookBody>(req, secret, true);
  if (!isValidSignature) return Response.json({ message: "Chữ ký không hợp lệ" }, { status: 401 });

  const plan = body ? planRevalidation(body) : null;
  if (!plan) return Response.json({ revalidated: false, reason: "bỏ qua (draft / asset / lead / loại lạ)" });

  for (const tag of plan.tags) revalidateTag(tag, "max");
  for (const path of plan.paths) revalidatePath(path);
  return Response.json({ revalidated: true, ...plan });
}
