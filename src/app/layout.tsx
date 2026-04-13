import type { Metadata } from "next";

import GlobalDesktopContactDock from "@/components/GlobalDesktopContactDock";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tổ Ấm Hoàn Hảo",
    template: "%s | Tổ Ấm Hoàn Hảo",
  },
  description: "Tổ Ấm Hoàn Hảo - Nội thất xuất khẩu cao cấp cho không gian sống hiện đại.",
  applicationName: "Tổ Ấm Hoàn Hảo",
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
        {children}
        <GlobalDesktopContactDock />
      </body>
    </html>
  );
}
