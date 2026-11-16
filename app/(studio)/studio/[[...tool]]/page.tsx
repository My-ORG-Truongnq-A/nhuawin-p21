import type { Metadata } from "next";
import { metadata as studioMetadata } from "next-sanity/studio";
import { STUDIO_TITLE } from "@/sanity/env";
import { Studio } from "./Studio";

export { viewport } from "next-sanity/studio";

/** /studio luôn noindex ở mọi chế độ (T3.3); robots.txt production cũng chặn /studio. */
export const metadata: Metadata = {
  ...studioMetadata,
  title: STUDIO_TITLE,
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <Studio />;
}
