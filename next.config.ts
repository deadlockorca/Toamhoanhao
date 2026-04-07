import type { NextConfig } from "next";
import os from "node:os";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const localDevOrigins = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface): iface is NonNullable<typeof iface> => Boolean(iface))
  .filter((iface) => iface.family === "IPv4" && !iface.internal)
  .map((iface) => iface.address);

const getR2RemotePatterns = (): RemotePattern[] => {
  const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!r2PublicBaseUrl) {
    return [];
  }

  try {
    const parsedUrl = new URL(r2PublicBaseUrl);
    const protocol =
      parsedUrl.protocol === "https:"
        ? "https"
        : parsedUrl.protocol === "http:"
          ? "http"
          : null;

    if (!protocol) {
      return [];
    }

    const basePath = parsedUrl.pathname.replace(/\/+$/, "");
    const pathname = `${basePath}/**` || "/**";

    return [
      {
        protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname,
      },
    ];
  } catch {
    return [];
  }
};

const r2RemotePatterns = getR2RemotePatterns();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Reduce initial server memory usage on small VPS by lazy-loading route entries.
    preloadEntriesOnStart: false,
  },
  allowedDevOrigins: ["localhost", "127.0.0.1", ...localDevOrigins],
  images: {
    // cPanel shared hosting often runs out of memory when next/image falls back to WASM codecs.
    // Serve remote image URLs directly to avoid server-side image optimization crashes.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
      ...r2RemotePatterns,
    ],
  },
};

export default nextConfig;
