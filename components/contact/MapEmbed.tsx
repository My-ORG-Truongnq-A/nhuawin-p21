import { PinIcon } from "@/components/ui/icons";
import { addressLine } from "@/lib/contact/links";
import type { Address } from "@/lib/content/types";

/** Chỉ nhúng iframe Google Maps hợp lệ (embedUrl); thiếu → liên kết "Mở Google Maps" (OQ-CM-06). */
const EMBED = /^https:\/\/(www\.)?google\.com\/maps\/embed\?/;

export function MapEmbed({ address, title }: { address?: Address; title: string }) {
  if (address?.embedUrl && EMBED.test(address.embedUrl))
    return (
      <iframe
        src={address.embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-card border border-line"
      />
    );
  if (!address?.mapUrl) return null;
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-card border border-line bg-surface-2 p-6 text-center">
      <PinIcon className="size-8 text-brand-ink" />
      <p className="text-muted">{addressLine(address)}</p>
      <a
        href={address.mapUrl}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-11 items-center rounded-pill bg-brand px-5 text-sm font-semibold text-surface hover:bg-brand-700"
      >
        Mở Google Maps
      </a>
    </div>
  );
}
