import "server-only";
import { isDryRun } from "./deliver";
import type { Env } from "./lead";
import { LEAD_KINDS, type LeadKind } from "./schema";

/**
 * Trạng thái giao lead cho QA (LD-01, `GET /api/leads/status`).
 * `dryRun` dùng đúng `isDryRun` của `deliverLead`; `kinds` = `LEAD_KINDS` mà `handleLead`
 * dùng để nhận `$kind` trước khi giao. Không trả env, đích CRM hay khoá nào.
 */
export type LeadsStatus = { dryRun: boolean; kinds: LeadKind[] };

export function leadsStatus(env: Env): LeadsStatus {
  return { dryRun: isDryRun(env), kinds: [...LEAD_KINDS] };
}

export function leadsStatusResponse(env: Env): Response {
  return Response.json(leadsStatus(env), { headers: { "cache-control": "no-store" } });
}
