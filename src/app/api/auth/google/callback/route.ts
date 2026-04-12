import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  cookieOptions,
  createSession,
  hashPassword,
  normalizeEmail,
  normalizeFullName,
  purgeExpiredSessions,
  shouldUseSecureCookie,
  validateEmail,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPublicUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE_NAME = "toam_google_oauth_state";

type GoogleTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenInfoResponse = {
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
};

const resolveRedirectUri = (request: Request) => {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  return createPublicUrl(request, "/api/auth/google/callback").toString();
};

const createAccountRedirectUrl = (request: Request, params?: Record<string, string>) => {
  const url = createPublicUrl(request, "/tai-khoan");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url;
};

const parseEmailVerified = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
};

const normalizeGoogleName = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeFullName(value);
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 120);
};

export async function GET(request: Request) {
  const secure = shouldUseSecureCookie(request);
  const cookieStore = await cookies();
  const clearGoogleStateCookie = () => {
    cookieStore.set(GOOGLE_STATE_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  };

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      clearGoogleStateCookie();
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_not_configured",
        }),
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    const stateFromCookie = cookieStore.get(GOOGLE_STATE_COOKIE_NAME)?.value ?? "";

    clearGoogleStateCookie();

    if (oauthError) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_access_denied",
        }),
      );
    }

    if (!code || !state || !stateFromCookie || state !== stateFromCookie) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_state_invalid",
        }),
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: resolveRedirectUri(request),
      }),
      cache: "no-store",
    });

    const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenPayload.id_token) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_exchange_failed",
        }),
      );
    }

    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenPayload.id_token)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfoResponse;
    const email = typeof tokenInfo.email === "string" ? normalizeEmail(tokenInfo.email) : "";
    const emailVerified = parseEmailVerified(tokenInfo.email_verified);
    const isAudienceValid = typeof tokenInfo.aud === "string" && tokenInfo.aud === clientId;

    if (!tokenInfoResponse.ok || !isAudienceValid || !email || !validateEmail(email)) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_profile_failed",
        }),
      );
    }

    if (!emailVerified) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_email_unverified",
        }),
      );
    }

    await purgeExpiredSessions();

    const googleName = normalizeGoogleName(tokenInfo.name);
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email,
            fullName: googleName,
            passwordHash: hashPassword(randomBytes(24).toString("hex")),
          },
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
          throw error;
        }
      }
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });
    }

    if (!user) {
      return NextResponse.redirect(
        createAccountRedirectUrl(request, {
          oauthError: "google_profile_failed",
        }),
      );
    }

    if (!user.fullName && googleName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: googleName,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });
    }

    const session = await createSession(user.id);
    cookieStore.set(AUTH_COOKIE_NAME, session.token, cookieOptions(secure));

    return NextResponse.redirect(
      createAccountRedirectUrl(request, {
        oauth: "google_success",
      }),
    );
  } catch {
    clearGoogleStateCookie();
    return NextResponse.redirect(
      createAccountRedirectUrl(request, {
        oauthError: "google_callback_failed",
      }),
    );
  }
}
