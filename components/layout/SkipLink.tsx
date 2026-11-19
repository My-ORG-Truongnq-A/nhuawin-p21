export const MAIN_ID = "noi-dung";

/**
 * Phần tử focus đầu tiên của trang (T1.2, TC).
 * Không dùng `sr-only`: vùng 1 px bị header dính (z-40) đè lên (MB-03). Khi chưa focus, link nằm
 * hẳn phía trên mép viewport; khi focus trượt xuống, nổi trên header (z-60), vùng chạm ≥ 44 px (MB-05).
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="fixed left-4 top-2 z-60 inline-flex min-h-11 -translate-y-[calc(100%+1rem)] items-center rounded-md bg-ink-900 px-4 font-semibold text-surface focus:translate-y-0 motion-safe:transition-transform"
    >
      Bỏ qua tới nội dung
    </a>
  );
}
