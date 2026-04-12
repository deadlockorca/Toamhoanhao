import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { shouldUseSecureCookie } from "@/lib/auth";
import { createPublicUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE_NAME = "toam_google_oauth_state";
const GOOGLE_STATE_MAX_AGE_SECONDS = 60 * 10;

const resolveRedirectUri = (request: Request) => {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  return createPublicUrl(request, "/api/auth/google/callback").toString();
};

const redirectToAccountWithError = (request: Request, errorCode: string) => {
  const url = createPublicUrl(request, "/tai-khoan");
  url.searchParams.set("oauthError", errorCode);
  return NextResponse.redirect(url);
};

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return redirectToAccountWithError(request, "google_not_configured");
  }

  const secure = shouldUseSecureCookie(request);
  const state = randomBytes(16).toString("hex");
  const redirectUri = resolveRedirectUri(request);

  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: GOOGLE_STATE_MAX_AGE_SECONDS,
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("access_type", "online");

  return NextResponse.redirect(url);
}
