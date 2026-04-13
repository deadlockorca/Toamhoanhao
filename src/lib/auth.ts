import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "toam_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const SCRYPT_KEY_LENGTH = 64;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthPublicUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type SessionWithUser = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  user: AuthPublicUser;
};

const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateEmail = (value: string) => EMAIL_PATTERN.test(normalizeEmail(value));

export const validatePassword = (value: string) => value.trim().length >= 8;

export const normalizeFullName = (value: string) => value.trim().replace(/\s+/g, " ");

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derived}`;
};

export const verifyPassword = (password: string, passwordHash: string) => {
  const [algorithm, salt, expectedHex] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) {
    return false;
  }

  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = Buffer.from(scryptSync(password, salt, SCRYPT_KEY_LENGTH));
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

export const createSession = async (userId: string) => {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const tokenHash = hashSessionToken(token);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
};

export const deleteSessionByToken = async (token: string) => {
  const tokenHash = hashSessionToken(token);
  await prisma.userSession.deleteMany({
    where: {
      tokenHash,
    },
  });
};

export const purgeExpiredSessions = async () => {
  await prisma.userSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

export const getSessionByToken = async (token: string): Promise<SessionWithUser | null> => {
  const tokenHash = hashSessionToken(token);
  const session = await prisma.userSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.delete({
      where: {
        id: session.id,
      },
    });
    return null;
  }

  if (!session.user.isActive) {
    await prisma.userSession.delete({
      where: {
        id: session.id,
      },
    });
    return null;
  }

  return session;
};

export const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
});

export const shouldUseSecureCookie = (request: Request) => {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
};
