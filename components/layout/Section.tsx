import type { ReactNode } from "react";
import { Container } from "./Container";

const TONES = {
  base: "bg-surface",
  alt: "bg-surface-2",
  dark: "bg-ink-950 text-surface",
} as const;

/**
 * Khối nội dung chuẩn. Có `id` thì anchor không bị header che: scroll-margin-top ≥ chiều cao header
 * (đặt toàn cục cho [id] trong globals.css, T1.6).
 */
export function Section({
  id,
  tone = "base",
  children,
  labelledBy,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`py-section ${TONES[tone]}`}>
      <Container>{children}</Container>
    </section>
  );
}
