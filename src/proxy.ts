import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authenticateAdminFromEnv,
  canAccessAdminPath,
  getAdminCredential,
  getDefaultAdminPathByRole,
  isAdminRole,
} from "@/lib/admin-auth";

const UNAUTHORIZED_HEADERS = {
  "WWW-Authenticate": 'Basic realm="Admin Area"',
};

const unauthorizedResponse = () =>
  new NextResponse("Unauthorized", {
    status: 401,
    headers: UNAUTHORIZED_HEADERS,
  });

export async function proxy(request: NextRequest) {
  const credentialConfig = getAdminCredential();
  if (!credentialConfig.ok) {
    return new NextResponse(credentialConfig.error, {
      status: 500,
    });
  }

  const authorizationHeader = request.headers.get("authorization");
  let identity = authenticateAdminFromEnv(authorizationHeader);

  if (!identity) {
    if (!authorizationHeader) {
      return unauthorizedResponse();
    }

    const verificationUrl = new URL("/api/internal/admin-basic-auth", request.url);
    let verificationResponse: Response;

    try {
      verificationResponse = await fetch(verificationUrl, {
        method: "GET",
        headers: {
          authorization: authorizationHeader,
        },
        cache: "no-store",
      });
    } catch {
      return new NextResponse("Authentication service unavailable.", {
        status: 503,
      });
    }

    if (!verificationResponse.ok) {
      return unauthorizedResponse();
    }

    const verificationPayload = (await verificationResponse.json()) as {
      authenticated?: boolean;
      role?: string;
      username?: string;
    };

    if (
      !verificationPayload.authenticated ||
      !isAdminRole(verificationPayload.role) ||
      typeof verificationPayload.username !== "string"
    ) {
      return unauthorizedResponse();
    }

    identity = {
      role: verificationPayload.role,
      username: verificationPayload.username,
    };
  }

  const pathname = request.nextUrl.pathname;
  if (!canAccessAdminPath(identity.role, pathname)) {
    return new NextResponse("Forbidden", {
      status: 403,
    });
  }

  if (pathname === "/admin" || pathname === "/admin/") {
    const targetPath = getDefaultAdminPathByRole(identity.role);
    const redirectUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-role", identity.role);
  requestHeaders.set("x-admin-username", identity.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
