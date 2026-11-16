import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { getSiteSettings } from "@/lib/content";
import { serverEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const verification = serverEnv().tracking.googleSiteVerification;
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: settings.brandName,
    // Trang không tự đặt title dùng template; trang dùng buildMetadata đặt title tuyệt đối.
    title: { default: settings.brandName, template: `%s | ${settings.brandName}` },
    description: settings.description,
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Root layout của site công khai (Studio có root layout riêng, không header/footer/nút nổi). */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
