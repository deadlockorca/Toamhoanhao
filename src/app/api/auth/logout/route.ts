import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, cookieOptions, deleteSessionByToken, shouldUseSecureCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const secure = shouldUseSecureCookie(request);
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      await deleteSessionByToken(token);
    }

    cookieStore.set(AUTH_COOKIE_NAME, "", {
      ...cookieOptions(secure),
      maxAge: 0,
      expires: new Date(0),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Không thể đăng xuất lúc này." }, { status: 500 });
  }
}
