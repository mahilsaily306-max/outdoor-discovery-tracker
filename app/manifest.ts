import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VERDA — Outdoor AI Companion",
    short_name: "VERDA",
    description: "AI that gets out of your way. Real-world outdoor missions that encourage you to put down your phone and touch grass.",
    start_url: "/",
    display: "standalone",
    background_color: "#07120c",
    theme_color: "#0f2317",
    orientation: "portrait",
    categories: ["lifestyle", "outdoors", "health", "mindfulness"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
