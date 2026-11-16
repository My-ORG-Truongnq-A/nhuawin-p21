import Link from "next/link";
import type { ComponentProps } from "react";

const VARIANTS = {
  primary: "bg-brand text-surface hover:bg-brand-700",
  secondary: "border border-brand bg-surface text-brand-ink hover:bg-brand-100",
  hot: "bg-hot text-surface hover:brightness-95",
} as const;

const SIZES = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
} as const;

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

/** Nút dạng link. Vùng chạm ≥ 44 px (MB, TC). Map class đầy đủ, không nội suy (GD-02). */
export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: Props) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors duration-150 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    />
  );
}
