import { serverEnv } from "@/lib/env";
import { queueBootScript, tagScriptUrl, trackingConfig } from "@/lib/analytics/config";
import { AttributionCapture } from "./AttributionCapture";
import { ContactClickTracker } from "./ContactClickTracker";
import { TagLoader } from "./TagLoader";

/**
 * Đo lường của site công khai (T5.4, REQ-23; TR-01…TR-03, HN-05, LD-05). Studio không dùng vỏ này.
 * - Ghi nguồn lead (UTM first-touch + last non-direct) luôn chạy: cookie first-party, không gửi đi đâu.
 * - GTM / GA4: chỉ khi VERCEL_ENV=production và có ID trong env (NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_GA_ID);
 *   trống → 0 thẻ script đo lường trong HTML.
 */
export function Analytics() {
  const { production, tracking } = serverEnv();
  const cfg = trackingConfig({ production, gtmId: tracking.gtmId, gaId: tracking.gaId });
  return (
    <>
      <AttributionCapture />
      {cfg && (
        <>
          <script id="tracking-queue" dangerouslySetInnerHTML={{ __html: queueBootScript(cfg) }} />
          <TagLoader src={tagScriptUrl(cfg)} />
          <ContactClickTracker />
        </>
      )}
    </>
  );
}
