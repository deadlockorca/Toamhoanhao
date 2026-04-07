import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  cookieOptions,
  createSession,
  normalizeEmail,
  purgeExpiredSessions,
  shouldUseSecureCookie,
  validateEmail,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

const parsePayload = (payload: LoginPayload) => ({
  email: typeof payload.email === "string" ? normalizeEmail(payload.email) : "",
  password: typeof payload.password === "string" ? payload.password : "",
});

export async function POST(request: Request) {
  try {
    const rawPayload = (await request.json()) as unknown;
    if (typeof rawPayload !== "object" || rawPayload === null) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const payload = parsePayload(rawPayload as LoginPayload);

    if (!validateEmail(payload.email) || !payload.password) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không hợp lệ." }, { status: 400 });
    }

    await purgeExpiredSessions();

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
      },
    });

    if (!user || !verifyPassword(payload.password, user.passwordHash)) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 });
    }

    const session = await createSession(user.id);
    const secure = shouldUseSecureCookie(request);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, session.token, cookieOptions(secure));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      message: "Đăng nhập thành công.",
    });
  } catch {
    return NextResponse.json({ error: "Không thể đăng nhập lúc này." }, { status: 500 });
  }
}
