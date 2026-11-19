import { Barlow_Semi_Condensed, Be_Vietnam_Pro } from "next/font/google";

/**
 * Font tự host qua next/font, subset vietnamese + latin (GD-03). Tối đa 2 họ.
 * Đề xuất theo design_tokens (MI-06 chờ khách xác nhận).
 */
export const fontSans = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

/** Chữ hẹp cho số liệu kỹ thuật (mm, ly, tấm/kẹp). Không preload: không nằm trong LCP. */
export const fontSpec = Barlow_Semi_Condensed({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});
