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
