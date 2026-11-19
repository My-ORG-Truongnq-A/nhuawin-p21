import type { Attribution } from "./attribution";
import type { LeadKind } from "./schema";

/** Lead đã qua kiểm ở server, sẵn sàng giao (CRM / Sanity + Gmail). */
export type Lead = {
  /** UUID ngẫu nhiên (không chứa PII) — khoá idempotent, `_id` Sanity, `request_id` CRM. */
  requestId: string;
  kind: LeadKind;
  /** Trường đã chuẩn hoá (SĐT E.164), không có trường rỗng. */
  fields: Record<string, string>;
  /** Path trang gửi form (vd /bao-gia). */
  page: string;
  /** URL tuyệt đối trên host chuẩn. */
  pageUrl: string;
  attribution: Attribution;
  submittedAt: string;
};

export type Delivery = { ok: true; dryRun?: boolean } | { ok: false; reason: string };

export type Env = Record<string, string | undefined>;

/** Nhãn tiếng Việt của trường (mail thông báo / Studio). */
export const FIELD_LABELS: Record<string, string> = {
  name: "Họ và tên",
  phone: "Số điện thoại",
  role: "Bạn là / loại hình",
  need: "Nhu cầu",
  product: "Loại tấm",
  quantity: "Số lượng dự kiến",
  province: "Tỉnh / thành",
  company: "Công ty / cửa hàng",
  note: "Ghi chú",
};

export const KIND_LABELS: Record<LeadKind, string> = {
  contact: "Liên hệ",
  quote: "Báo giá",
  partnership: "Đăng ký hợp tác",
};
