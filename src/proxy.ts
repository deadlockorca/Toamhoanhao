import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const UNAUTHORIZED_HEADERS = {
  "WWW-Authenticate": 'Basic realm="Admin Area"',
};

const unauthorizedResponse = () =>
  new NextResponse("Unauthorized", {
    status: 401,
    headers: UNAUTHORIZED_HEADERS,
  });

const parseBasicAuth = (authorizationHeader: string | null) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return null;
  }

  const encodedCredentials = authorizationHeader.slice("Basic ".length).trim();
  if (!encodedCredentials) {
    return null;
  }

  try {
    const decoded = atob(encodedCredentials);
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

export function proxy(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return new NextResponse("Missing ADMIN_PASSWORD environment variable.", {
      status: 500,
    });
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));
  if (!credentials) {
    return unauthorizedResponse();
  }

  const isAuthorized =
    credentials.username === expectedUsername && credentials.password === expectedPassword;

  if (!isAuthorized) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
