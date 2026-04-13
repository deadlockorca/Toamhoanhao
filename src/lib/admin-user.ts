import { Prisma } from "@prisma/client";

import { normalizeFullName, validatePassword } from "@/lib/auth";
import { toRecord } from "@/lib/admin-parser";

export const adminUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
      sessions: true,
    },
  },
} satisfies Prisma.UserSelect;

export type AdminUserRow = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

export const toAdminUserResponse = (user: AdminUserRow) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  ordersCount: user._count.orders,
  activeSessionsCount: user._count.sessions,
});

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

const parseOptionalBoolean = (
  value: unknown,
): { ok: true; value: boolean } | { ok: false } => {
  if (typeof value === "boolean") {
    return { ok: true, value };
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return { ok: true, value: true };
    }
    if (FALSE_VALUES.has(normalized)) {
      return { ok: true, value: false };
    }
  }

  return { ok: false };
};

const normalizeOptionalString = (
  value: unknown,
  maxLength: number,
): { ok: true; value: string | null } | { ok: false } => {
  if (value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false };
  }

  const cleaned = value.trim();
  if (!cleaned) {
    return { ok: true, value: null };
  }

  return { ok: true, value: cleaned.slice(0, maxLength) };
};

export type UpdateAdminUserInput = {
  fullName?: string | null;
  phone?: string | null;
  isActive?: boolean;
  newPassword?: string;
};

export const parseUpdateAdminUserInput = (
  input: unknown,
): { ok: true; data: UpdateAdminUserInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const data: UpdateAdminUserInput = {};
  let touched = false;

  if (payload.fullName !== undefined) {
    const parsed = normalizeOptionalString(payload.fullName, 120);
    if (!parsed.ok) {
      return { ok: false, error: "Họ tên không hợp lệ." };
    }

    data.fullName = parsed.value ? normalizeFullName(parsed.value) : null;
    touched = true;
  }

  if (payload.phone !== undefined) {
    const parsed = normalizeOptionalString(payload.phone, 30);
    if (!parsed.ok) {
      return { ok: false, error: "Số điện thoại không hợp lệ." };
    }

    data.phone = parsed.value;
    touched = true;
  }

  if (payload.isActive !== undefined) {
    const parsed = parseOptionalBoolean(payload.isActive);
    if (!parsed.ok) {
      return { ok: false, error: "Trạng thái kích hoạt không hợp lệ." };
    }

    data.isActive = parsed.value;
    touched = true;
  }

  if (payload.newPassword !== undefined) {
    if (typeof payload.newPassword !== "string") {
      return { ok: false, error: "Mật khẩu mới không hợp lệ." };
    }

    const newPassword = payload.newPassword.trim();
    if (!validatePassword(newPassword)) {
      return { ok: false, error: "Mật khẩu mới phải có ít nhất 8 ký tự." };
    }

    data.newPassword = newPassword;
    touched = true;
  }

  if (!touched) {
    return { ok: false, error: "Chưa có thông tin nào để cập nhật." };
  }

  return { ok: true, data };
};
