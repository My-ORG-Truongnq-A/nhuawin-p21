"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

/**
 * Lỗi khi render (KT-06): nút "Thử lại" + đường liên hệ. Header, footer và nút Gọi / Zalo (có hotline)
 * vẫn hiển thị vì nằm trong layout.
 */
export default function SiteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-section">
      <h1 className="text-3xl font-extrabold">Trang đang gặp sự cố</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">
        Xin lỗi, đã có lỗi khi tải nội dung. Bạn thử lại, hoặc gọi hotline / nhắn Zalo bằng nút liên hệ ở góc màn hình.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center rounded-pill bg-brand px-5 font-semibold text-surface hover:bg-brand-700"
        >
          Thử lại
        </button>
        <Link href="/lien-he" className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 font-semibold text-brand-ink">
          Trang liên hệ
        </Link>
      </div>
    </Container>
  );
}
