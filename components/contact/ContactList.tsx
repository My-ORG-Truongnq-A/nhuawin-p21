import { ChatIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { addressLine, telHref } from "@/lib/contact/links";
import type { SiteSettings } from "@/lib/content/types";

/** NAP đọc từ siteSettings (REQ-03): địa chỉ, SĐT, email, giờ làm việc, Zalo. Trường trống thì ẩn. */
export function ContactList({ settings }: { settings: SiteSettings }) {
  const { address, phones, email, openingHours, hoursNote, zalo } = settings;
  const street = addressLine(address);
  const row = "flex gap-3";
  const icon = "mt-1 shrink-0 text-brand-ink";

  return (
    <ul className="space-y-3 text-sm">
      {street && (
        <li className={row}>
          <PinIcon className={icon} />
          <span>
            {street}
            {address?.mapUrl && (
              <>
                {" · "}
                <a href={address.mapUrl} target="_blank" rel="noopener" className="font-semibold text-brand-ink underline underline-offset-2">
                  Xem đường đi
                </a>
              </>
            )}
          </span>
        </li>
      )}
      {phones.length > 0 && (
        <li className={row}>
          <PhoneIcon className={icon} />
          <span className="flex flex-wrap gap-x-2">
            {phones.map((p, i) => (
              <span key={p.number}>
                {i > 0 && <span aria-hidden="true">· </span>}
                <a href={telHref(p.e164 ?? p.number)} className="font-semibold text-ink hover:text-brand-ink">
                  {p.label ? `${p.label}: ` : ""}
                  {p.number}
                </a>
              </span>
            ))}
          </span>
        </li>
      )}
      {zalo && (
        <li className={row}>
          <ChatIcon className={icon} />
          <a href={zalo.url} target="_blank" rel="noopener" className="font-semibold text-ink hover:text-brand-ink">
            {zalo.label}
          </a>
        </li>
      )}
      {email && (
        <li className={row}>
          <MailIcon className={icon} />
          <a href={`mailto:${email}`} className="text-ink hover:text-brand-ink">
            {email}
          </a>
        </li>
      )}
      {openingHours.length > 0 && (
        <li className={row}>
          <ClockIcon className={icon} />
          <span>
            {openingHours.map((h) => (
              <span key={h.label} className="block">
                {h.label}: {h.opens} – {h.closes}
              </span>
            ))}
            {hoursNote && <span className="block text-muted">{hoursNote}</span>}
          </span>
        </li>
      )}
    </ul>
  );
}
