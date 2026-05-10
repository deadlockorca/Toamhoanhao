export type AdminRole = "ADMIN" | "MEDIA" | "ORDER_STAFF";

export type AdminSection =
  | "products"
  | "variants"
  | "banners"
  | "orders"
  | "users"
  | "staff";

type AdminCredential = {
  role: AdminRole;
  username: string;
  password: string;
};

const decodeBase64 = (value: string) => {
  if (typeof atob === "function") {
    return atob(value);
  }

  return Buffer.from(value, "base64").toString("utf-8");
};

const normalizePathname = (pathname: string) => {
  if (!pathname) {
    return "/";
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

const pathMatchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const parseBasicAuth = (authorizationHeader: string | null) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return null;
  }

  const encodedCredentials = authorizationHeader.slice("Basic ".length).trim();
  if (!encodedCredentials) {
    return null;
  }

  try {
    const decoded = decodeBase64(encodedCredentials);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
};

export const getAdminCredential = ():
  | { ok: true; credential: AdminCredential }
  | { ok: false; error: string } => {
  const adminUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { ok: false, error: "Missing ADMIN_PASSWORD environment variable." };
  }

  return {
    ok: true,
    credential: {
      role: "ADMIN",
      username: adminUsername,
      password: adminPassword,
    },
  };
};

export const authenticateAdminFromEnv = (authorizationHeader: string | null) => {
  const parsed = parseBasicAuth(authorizationHeader);
  if (!parsed) {
    return null;
  }

  const resolvedCredential = getAdminCredential();
  if (!resolvedCredential.ok) {
    return null;
  }

  const credential = resolvedCredential.credential;
  if (
    credential.username !== parsed.username ||
    credential.password !== parsed.password
  ) {
    return null;
  }

  return {
    role: credential.role,
    username: credential.username,
  };
};

export const isAdminRole = (value: string | null | undefined): value is AdminRole =>
  value === "ADMIN" || value === "MEDIA" || value === "ORDER_STAFF";

export const getRoleLabel = (role: AdminRole) => {
  if (role === "ADMIN") {
    return "Quản trị viên";
  }
  if (role === "MEDIA") {
    return "Nhân sự Media";
  }
  return "Nhân viên đơn hàng";
};

export const getAllowedAdminSections = (role: AdminRole): AdminSection[] => {
  if (role === "ADMIN") {
    return ["products", "variants", "banners", "orders", "users", "staff"];
  }

  if (role === "MEDIA") {
    return ["banners"];
  }

  return ["orders"];
};

export const getDefaultAdminPathByRole = (role: AdminRole) => {
  if (role === "ADMIN") {
    return "/admin/products";
  }

  if (role === "MEDIA") {
    return "/admin/banners";
  }

  return "/admin/orders";
};

const isAllowedForMedia = (pathname: string) => {
  const allowedPrefixes = [
    "/admin/banners",
    "/api/admin/banners",
    "/api/admin/uploads",
    "/api/admin/me",
  ];

  return allowedPrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
};

const isAllowedForOrderStaff = (pathname: string) => {
  const allowedPrefixes = ["/admin/orders", "/api/admin/orders", "/api/admin/me"];
  return allowedPrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
};

export const canAccessAdminPath = (role: AdminRole, pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);

  if (role === "ADMIN") {
    return true;
  }

  if (normalizedPathname === "/admin" || normalizedPathname === "/admin/switch-account") {
    return true;
  }

  if (role === "MEDIA") {
    return isAllowedForMedia(normalizedPathname);
  }

  return isAllowedForOrderStaff(normalizedPathname);
};

export const normalizeAdminUsername = (value: string) =>
  value.trim().toLowerCase();

export const isReservedAdminUsername = (value: string) => {
  const normalizedValue = normalizeAdminUsername(value);
  const adminUsername = normalizeAdminUsername(process.env.ADMIN_USERNAME?.trim() || "admin");
  return normalizedValue === adminUsername;
};
