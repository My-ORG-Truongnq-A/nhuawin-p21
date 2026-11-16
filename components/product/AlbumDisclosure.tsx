"use client";

import { type ReactNode, useId, useRef, useState } from "react";

/**
 * Album ứng dụng (S2, REQ-08): nút mở / đóng bằng chuột, chạm, Enter/Space (button gốc);
 * Esc đóng và trả focus về nút. Ảnh nằm sẵn trong HTML (đọc được khi tắt JS — panel chỉ ẩn khi có JS).
 */
export function AlbumDisclosure({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = `${id}-noi-dung`;
  const uid = useId();

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        id={`${id}-nut`}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-brand px-4 text-sm font-semibold text-brand-ink hover:bg-brand-100"
      >
        {open ? "Đóng album ảnh" : label}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id={panelId} role="region" aria-labelledby={`${id}-nut`} data-uid={uid} hidden={!open} className="mt-4">
        {children}
      </div>
    </div>
  );
}
