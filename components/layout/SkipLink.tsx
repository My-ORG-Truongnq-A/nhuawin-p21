export const MAIN_ID = "noi-dung";

/** Phần tử focus đầu tiên của trang (T1.2, TC). */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only z-50 rounded-md bg-ink-900 px-4 py-3 font-semibold text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Bỏ qua tới nội dung
    </a>
  );
}
