import type { MetadataRoute } from "next";

/** Web app manifest (served at /manifest.webmanifest) — makes Todu installable. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Todu",
    short_name: "Todu",
    description: "Clean, fast tasks — your Todu, anywhere.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    categories: ["productivity"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
