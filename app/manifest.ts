import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nhựa WIN Việt Nam",
    short_name: "Nhựa WIN",
    lang: "vi",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0b4da8",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
