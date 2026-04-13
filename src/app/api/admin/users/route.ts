import { NextResponse } from "next/server";

import { adminUserSelect, toAdminUserResponse, type AdminUserRow } from "@/lib/admin-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_TAKE = 120;
const MAX_TAKE = 300;

type UserFilterStatus = "all" | "active" | "inactive";

const parseTake = (raw: string | null) => {
  if (!raw) {
    return DEFAULT_TAKE;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TAKE;
  }

  return Math.min(Math.floor(parsed), MAX_TAKE);
};

const parseStatus = (raw: string | null): UserFilterStatus => {
  if (raw === "active" || raw === "inactive") {
    return raw;
  }
  return "all";
};

const parseSearch = (raw: string | null) => {
  if (!raw) {
    return "";
  }
  return raw.trim().slice(0, 120);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const take = parseTake(url.searchParams.get("take"));
    const status = parseStatus(url.searchParams.get("status"));
    const search = parseSearch(url.searchParams.get("search"));

    const where: {
      isActive?: boolean;
      OR?: Array<{
        email?: { contains: string };
        fullName?: { contains: string };
        phone?: { contains: string };
      }>;
    } = {};

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { fullName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, totalUsers, activeUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take,
        select: adminUserSelect,
      }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      users: (users as AdminUserRow[]).map(toAdminUserResponse),
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(0, totalUsers - activeUsers),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải danh sách tài khoản.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
