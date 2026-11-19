import type { ReactNode } from "react";

/** Root layout riêng cho Studio: không header/footer/nút nổi, không tracking, không widget (KT-04). */
export default function StudioRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
