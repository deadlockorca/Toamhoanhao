import type { Metadata } from "next";

import GlobalDesktopContactDock from "@/components/GlobalDesktopContactDock";
import { createSiteUrlObject, toAbsoluteUrl } from "@/lib/seo";
import "./globals.css";

const metadataBase = createSiteUrlObject();

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tổ Ấm Hoàn Hảo",
  url: toAbsoluteUrl("/"),
  logo: toAbsoluteUrl("/icon.svg"),
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+84-901-827-555",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Tổ Ấm Hoàn Hảo",
    template: "%s | Tổ Ấm Hoàn Hảo",
  },
  description: "Tổ Ấm Hoàn Hảo - Nội thất xuất khẩu cao cấp cho không gian sống hiện đại.",
  applicationName: "Tổ Ấm Hoàn Hảo",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
        <GlobalDesktopContactDock />
      </body>
    </html>
  );
}
