import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HKBookkeep — 香港記帳",
    short_name: "HKBookkeep",
    description:
      "多生意簿、輕量記帳，專為香港 freelancer 同網店小賣家。",
    start_url: "/app",
    display: "standalone",
    background_color: "#faf5ff",
    theme_color: "#9333ea",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
