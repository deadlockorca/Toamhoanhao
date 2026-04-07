import { Prisma } from "@prisma/client";
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
  validatePassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RegisterPayload = {
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  fullName?: unknown;
};

const parsePayload = (payload: RegisterPayload) => ({
  email: typeof payload.email === "string" ? normalizeEmail(payload.email) : "",
  password: typeof payload.password === "string" ? payload.password : "",
  confirmPassword: typeof payload.confirmPassword === "string" ? payload.confirmPassword : "",
  fullName: typeof payload.fullName === "string" ? normalizeFullName(payload.fullName) : "",
});

export async function POST(request: Request) {
  try {
    const rawPayload = (await request.json()) as unknown;
    if (typeof rawPayload !== "object" || rawPayload === null) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const payload = parsePayload(rawPayload as RegisterPayload);

    if (!validateEmail(payload.email)) {
      return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
    }

    if (!validatePassword(payload.password)) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự." }, { status: 400 });
    }

    if (payload.password !== payload.confirmPassword) {
      return NextResponse.json({ error: "Mật khẩu xác nhận không khớp." }, { status: 400 });
    }

    if (payload.fullName.length > 120) {
      return NextResponse.json({ error: "Họ tên không được vượt quá 120 ký tự." }, { status: 400 });
    }

    await purgeExpiredSessions();

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName || null,
        passwordHash: hashPassword(payload.password),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    const session = await createSession(user.id);
    const secure = shouldUseSecureCookie(request);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, session.token, cookieOptions(secure));

    return NextResponse.json(
      {
        user,
        message: "Đăng ký thành công.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email này đã được đăng ký." }, { status: 409 });
    }

    return NextResponse.json({ error: "Không thể đăng ký tài khoản." }, { status: 500 });
  }
}
