import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, cookieOptions, getSessionByToken, shouldUseSecureCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const secure = shouldUseSecureCookie(request);
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      cookieStore.set(AUTH_COOKIE_NAME, "", {
        ...cookieOptions(secure),
        maxAge: 0,
        expires: new Date(0),
      });
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
