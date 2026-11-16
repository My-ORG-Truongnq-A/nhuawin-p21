"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getLeadForms, getProductGroups, getSiteSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";
import { FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, parseTouch } from "./attribution";
import { handleLead, type LeadState } from "./handle";
import { clientIp, kvFromEnv } from "./rate-limit";

export type { LeadState } from "./handle";

/**
 * Server action dùng chung 3 form (T5.2, REQ-04). Định nghĩa form (lựa chọn hợp lệ, câu chữ)
 * đọc lại từ CMS ở server — không tin dữ liệu browser. Logic ở `handleLead` (có test).
 * Next tự kiểm Origin của server action (chống CSRF).
 */
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  const [forms, groups, settings, h, jar] = await Promise.all([getLeadForms(), getProductGroups(), getSiteSettings(), headers(), cookies()]);
  const hotline = settings.phones[0]?.number ?? "";

  return handleLead(form, {
    options: {
      roleOptions: forms.contact.roleOptions,
      needOptions: forms.contact.needOptions,
      productSlugs: groups.map((g) => g.slug),
    },
    messages: {
      success: forms.successMessage,
      error: forms.errorMessage.replace("{hotline}", hotline),
      rateLimited: `Bạn đã gửi nhiều lần trong ít phút. Vui lòng gọi ${hotline} để được hỗ trợ ngay.`,
    },
    ip: clientIp(h),
    attribution: {
      ft: parseTouch(jar.get(FIRST_TOUCH_COOKIE)?.value),
      lt: parseTouch(jar.get(LAST_TOUCH_COOKIE)?.value),
    },
    siteUrl: SITE_URL,
    env: process.env,
    store: kvFromEnv(process.env),
    now: new Date(),
    newId: randomUUID,
  });
}
