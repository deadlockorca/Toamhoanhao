import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
  isReservedAdminUsername,
  normalizeAdminUsername,
  type AdminRole,
} from "@/lib/admin-auth";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth";
import { toRecord } from "@/lib/admin-parser";
import { prisma } from "@/lib/prisma";

const ADMIN_STAFF_SETTING_KEY = "admin_staff_accounts_v1";
const ADMIN_STAFF_ROLES: ReadonlyArray<Exclude<AdminRole, "ADMIN">> = ["MEDIA", "ORDER_STAFF"];
const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/;

type StaffRole = (typeof ADMIN_STAFF_ROLES)[number];

type AdminStaffStoredAccount = {
  id: string;
  username: string;
  role: StaffRole;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const isStaffRole = (value: unknown): value is StaffRole =>
  typeof value === "string" && ADMIN_STAFF_ROLES.includes(value as StaffRole);

const parseIsoDate = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const parseStoredAccount = (value: unknown): AdminStaffStoredAccount | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const usernameRaw = typeof item.username === "string" ? item.username : "";
  const username = normalizeAdminUsername(usernameRaw);
  const role = item.role;
  const passwordHash = typeof item.passwordHash === "string" ? item.passwordHash.trim() : "";
  const createdAt = parseIsoDate(item.createdAt);
  const updatedAt = parseIsoDate(item.updatedAt);
  const isActive = typeof item.isActive === "boolean" ? item.isActive : true;

  if (!id || !username || !isStaffRole(role) || !passwordHash || !createdAt || !updatedAt) {
    return null;
  }

  if (!USERNAME_PATTERN.test(username)) {
    return null;
  }

  return {
    id,
    username,
    role,
    passwordHash,
    isActive,
    createdAt,
    updatedAt,
  };
};

const parseStoredAccounts = (rawValue: string | null) => {
  if (!rawValue) {
    return [] as AdminStaffStoredAccount[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [] as AdminStaffStoredAccount[];
    }

    return parsed
      .map((item) => parseStoredAccount(item))
      .filter((item): item is AdminStaffStoredAccount => Boolean(item))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [] as AdminStaffStoredAccount[];
  }
};

const loadAccountsFromSettingValue = (value: string | null) => parseStoredAccounts(value);

const loadAccountsWithClient = async (
  client: Prisma.TransactionClient | typeof prisma,
) => {
  const row = await client.siteSetting.findUnique({
    where: {
      key: ADMIN_STAFF_SETTING_KEY,
    },
    select: {
      value: true,
    },
  });

  return loadAccountsFromSettingValue(row?.value ?? null);
};

const saveAccountsWithClient = async (
  client: Prisma.TransactionClient | typeof prisma,
  accounts: AdminStaffStoredAccount[],
) => {
  await client.siteSetting.upsert({
    where: { key: ADMIN_STAFF_SETTING_KEY },
    update: {
      value: JSON.stringify(accounts),
    },
    create: {
      key: ADMIN_STAFF_SETTING_KEY,
      value: JSON.stringify(accounts),
    },
  });
};

const roleLabelMap: Record<StaffRole, string> = {
  MEDIA: "Nhân sự Media",
  ORDER_STAFF: "Nhân viên đơn hàng",
};

export const toAdminStaffResponse = (account: AdminStaffStoredAccount) => ({
  id: account.id,
  username: account.username,
  role: account.role,
  roleLabel: roleLabelMap[account.role],
  isActive: account.isActive,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

const normalizeUsernameOrNull = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeAdminUsername(value);
  if (!normalized) {
    return null;
  }

  return normalized;
};

const parseRole = (value: unknown): StaffRole | null => {
  if (!isStaffRole(value)) {
    return null;
  }

  return value;
};

export type CreateAdminStaffInput = {
  username: string;
  role: StaffRole;
  password: string;
  isActive: boolean;
};

export const parseCreateAdminStaffInput = (
  input: unknown,
): { ok: true; data: CreateAdminStaffInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const username = normalizeUsernameOrNull(payload.username);
  if (!username || !USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Tên đăng nhập không hợp lệ (3-40 ký tự, chỉ gồm chữ thường, số, ., _, -).",
    };
  }

  if (isReservedAdminUsername(username)) {
    return { ok: false, error: "Tên đăng nhập này đã được dành cho tài khoản quản trị chính." };
  }

  const role = parseRole(payload.role);
  if (!role) {
    return { ok: false, error: "Vai trò không hợp lệ." };
  }

  if (typeof payload.password !== "string" || !validatePassword(payload.password)) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  const isActive = payload.isActive === undefined ? true : payload.isActive === true;

  return {
    ok: true,
    data: {
      username,
      role,
      password: payload.password.trim(),
      isActive,
    },
  };
};

export type UpdateAdminStaffInput = {
  username?: string;
  role?: StaffRole;
  isActive?: boolean;
  newPassword?: string;
};

export const parseUpdateAdminStaffInput = (
  input: unknown,
): { ok: true; data: UpdateAdminStaffInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const data: UpdateAdminStaffInput = {};
  let touched = false;

  if (payload.username !== undefined) {
    const username = normalizeUsernameOrNull(payload.username);
    if (!username || !USERNAME_PATTERN.test(username)) {
      return {
        ok: false,
        error: "Tên đăng nhập không hợp lệ (3-40 ký tự, chỉ gồm chữ thường, số, ., _, -).",
      };
    }
    if (isReservedAdminUsername(username)) {
      return { ok: false, error: "Tên đăng nhập này đã được dành cho tài khoản quản trị chính." };
    }
    data.username = username;
    touched = true;
  }

  if (payload.role !== undefined) {
    const role = parseRole(payload.role);
    if (!role) {
      return { ok: false, error: "Vai trò không hợp lệ." };
    }
    data.role = role;
    touched = true;
  }

  if (payload.isActive !== undefined) {
    if (typeof payload.isActive !== "boolean") {
      return { ok: false, error: "Trạng thái kích hoạt không hợp lệ." };
    }
    data.isActive = payload.isActive;
    touched = true;
  }

  if (payload.newPassword !== undefined) {
    if (typeof payload.newPassword !== "string" || !validatePassword(payload.newPassword)) {
      return { ok: false, error: "Mật khẩu mới phải có ít nhất 8 ký tự." };
    }
    data.newPassword = payload.newPassword.trim();
    touched = true;
  }

  if (!touched) {
    return { ok: false, error: "Chưa có thông tin nào để cập nhật." };
  }

  return { ok: true, data };
};

export const listAdminStaffAccounts = async () => {
  const accounts = await loadAccountsWithClient(prisma);
  return accounts.map(toAdminStaffResponse);
};

export const createAdminStaffAccount = async (input: CreateAdminStaffInput) => {
  return prisma.$transaction(async (tx) => {
    const accounts = await loadAccountsWithClient(tx);
    const exists = accounts.some((item) => item.username === input.username);

    if (exists) {
      throw new Error("Tên đăng nhập đã tồn tại.");
    }

    const nowIso = new Date().toISOString();
    const nextAccount: AdminStaffStoredAccount = {
      id: randomUUID(),
      username: input.username,
      role: input.role,
      passwordHash: hashPassword(input.password),
      isActive: input.isActive,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const nextAccounts = [nextAccount, ...accounts];
    await saveAccountsWithClient(tx, nextAccounts);

    return toAdminStaffResponse(nextAccount);
  });
};

export const updateAdminStaffAccount = async (id: string, input: UpdateAdminStaffInput) => {
  return prisma.$transaction(async (tx) => {
    const accounts = await loadAccountsWithClient(tx);
    const index = accounts.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error("Không tìm thấy tài khoản nhân sự.");
    }

    const current = accounts[index];
    const nextUsername = input.username ?? current.username;
    const duplicate = accounts.some(
      (item) => item.id !== current.id && item.username === nextUsername,
    );
    if (duplicate) {
      throw new Error("Tên đăng nhập đã tồn tại.");
    }

    const nextAccount: AdminStaffStoredAccount = {
      ...current,
      username: nextUsername,
      role: input.role ?? current.role,
      isActive: input.isActive ?? current.isActive,
      passwordHash: input.newPassword ? hashPassword(input.newPassword) : current.passwordHash,
      updatedAt: new Date().toISOString(),
    };

    const nextAccounts = [...accounts];
    nextAccounts[index] = nextAccount;
    await saveAccountsWithClient(tx, nextAccounts);

    return toAdminStaffResponse(nextAccount);
  });
};

export const deleteAdminStaffAccount = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    const accounts = await loadAccountsWithClient(tx);
    const index = accounts.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error("Không tìm thấy tài khoản nhân sự.");
    }

    const [removed] = accounts.splice(index, 1);
    await saveAccountsWithClient(tx, accounts);

    return toAdminStaffResponse(removed);
  });
};

export const verifyAdminStaffCredential = async (usernameRaw: string, password: string) => {
  const username = normalizeAdminUsername(usernameRaw);
  if (!username || !password) {
    return null;
  }

  const accounts = await loadAccountsWithClient(prisma);
  const account = accounts.find((item) => item.username === username);
  if (!account || !account.isActive) {
    return null;
  }

  if (!verifyPassword(password, account.passwordHash)) {
    return null;
  }

  return {
    role: account.role,
    username: account.username,
  };
};
