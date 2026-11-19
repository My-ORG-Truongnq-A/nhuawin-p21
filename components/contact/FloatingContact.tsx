import { ChatIcon, FacebookIcon, PhoneIcon } from "@/components/ui/icons";
import { telHref } from "@/lib/contact/links";
import { getSiteSettings } from "@/lib/content";

/**
 * Cụm nút liên hệ nổi Facebook / Zalo / Gọi (T1.5, REQ-05 — giữ như web cũ, PA1).
 * Số / link đọc từ siteSettings; Facebook ẩn khi chưa xác nhận (MI-16). Nút 48 px, có aria-label tiếng Việt.
 */
export async function FloatingContact() {
  const settings = await getSiteSettings();
  const show = settings.floatingContact;
  if (!show.enabled) return null;
  const facebook = show.showFacebook ? settings.socials.find((s) => s.platform === "facebook" && s.confirmed) : undefined;
  const zalo = show.showZalo ? settings.zalo : undefined;
  const phone = show.showCall ? settings.phones[0] : undefined;
  const btn =
    "inline-flex size-12 items-center justify-center rounded-pill text-surface shadow-md transition-transform duration-150 [@media(hover:hover)]:hover:-translate-y-0.5";

  if (!facebook && !zalo && !phone) return null;

  return (
    <aside aria-label="Liên hệ nhanh" className="fixed bottom-4 right-3 z-30 print:hidden">
      <ul className="flex flex-col gap-3">
        {facebook && (
          <li>
            <a href={facebook.url} target="_blank" rel="noopener" aria-label={`Mở ${facebook.label} trên Facebook`} className={`${btn} bg-facebook`}>
              <FacebookIcon width={22} height={22} />
            </a>
          </li>
        )}
        {zalo && (
          <li>
            <a href={zalo.url} target="_blank" rel="noopener" aria-label="Nhắn Zalo" className={`${btn} bg-zalo`}>
              <ChatIcon width={22} height={22} />
            </a>
          </li>
        )}
        {phone && (
          <li>
            <a href={telHref(phone.e164 ?? phone.number)} aria-label={`Gọi hotline ${phone.number}`} className={`${btn} bg-hot`}>
              <PhoneIcon width={22} height={22} />
            </a>
          </li>
        )}
      </ul>
    </aside>
  );
}
