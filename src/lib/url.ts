const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeOrigin = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
};

const parseFirstHeaderPart = (value: string | null) => {
  if (!value) {
    return "";
  }
  return value.split(",")[0]?.trim() ?? "";
};

export const resolvePublicOrigin = (request: Request) => {
  const envCandidates = [
    process.env.APP_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXTAUTH_URL,
  ];

  for (const candidate of envCandidates) {
    if (!candidate) {
      continue;
    }
    const normalized = normalizeOrigin(candidate);
    if (normalized) {
      return trimTrailingSlash(normalized);
    }
  }

  const forwardedHost = parseFirstHeaderPart(request.headers.get("x-forwarded-host"));
  const forwardedProto = parseFirstHeaderPart(request.headers.get("x-forwarded-proto")) || "https";
  if (forwardedHost) {
    const normalized = normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
    if (normalized) {
      return trimTrailingSlash(normalized);
    }
  }

  const host = parseFirstHeaderPart(request.headers.get("host"));
  if (host) {
    const inferredProto = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
    const normalized = normalizeOrigin(`${inferredProto}://${host}`);
    if (normalized) {
      return trimTrailingSlash(normalized);
    }
  }

  return new URL(request.url).origin;
};

export const createPublicUrl = (request: Request, path: string) => {
  const origin = resolvePublicOrigin(request);
  return new URL(path, `${origin}/`);
};
