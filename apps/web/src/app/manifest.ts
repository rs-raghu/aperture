import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Aperture", short_name: "Aperture", description: "Your private personal dashboard.", start_url: "/today", scope: "/", display: "standalone", background_color: "#f4f7f4", theme_color: "#173b35", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }, { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }] };
}
