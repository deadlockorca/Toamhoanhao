import type { MetadataRoute } from "next";

import { toAbsoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/gio-hang",
        "/thanh-toan",
        "/dat-hang-thanh-cong",
        "/tai-khoan",
      ],
    },
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host: toAbsoluteUrl("/"),
  };
}
