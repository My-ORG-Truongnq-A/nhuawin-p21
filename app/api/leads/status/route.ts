import { connection } from "next/server";
import { leadsStatusResponse } from "@/lib/leads/status";

/**
 * LD-01: `{ dryRun, kinds }` để QA biết preview có gửi lead thật hay không.
 * Không khai `dynamic = "force-dynamic"`: Next 16 + cacheComponents báo lỗi build với config này;
 * `connection()` là cách tương đương — handler chạy mỗi request, env không đóng băng lúc build.
 */
export async function GET() {
  await connection();
  return leadsStatusResponse(process.env);
}
