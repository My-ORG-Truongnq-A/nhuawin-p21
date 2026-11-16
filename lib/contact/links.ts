/** Link liên hệ dựng từ số trong siteSettings — không hard-code số (REQ-03). */

export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

/** Số Việt Nam → E.164 (+84…) cho JSON-LD. */
export function toE164(number: string): string | undefined {
  const raw = number.replace(/[^\d+]/g, "");
  let digits: string;
  if (raw.startsWith("+")) digits = raw.slice(1);
  else if (raw.startsWith("84")) digits = raw;
  else if (raw.startsWith("0")) digits = `84${raw.slice(1)}`;
  else return undefined;
  return /^\d{9,13}$/.test(digits) ? `+${digits}` : undefined;
}

/** Địa chỉ một dòng: ưu tiên `display` trong CMS, thiếu thì ghép đường + tỉnh / thành. */
export function addressLine(a: { display?: string; street?: string; locality?: string } | undefined): string {
  return a?.display ?? [a?.street, a?.locality].filter(Boolean).join(", ");
}
