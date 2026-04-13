import { NextResponse } from "next/server";

import {
  adminUserSelect,
  parseUpdateAdminUserInput,
  toAdminUserResponse,
  type AdminUserRow,
} from "@/lib/admin-user";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = parseUpdateAdminUserInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản khách hàng." }, { status: 404 });
    }

    const shouldRevokeSessions =
      parsed.data.newPassword !== undefined ||
      (parsed.data.isActive !== undefined && parsed.data.isActive === false && existing.isActive);

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          ...(parsed.data.fullName !== undefined ? { fullName: parsed.data.fullName } : {}),
          ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
          ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
          ...(parsed.data.newPassword !== undefined
            ? { passwordHash: hashPassword(parsed.data.newPassword) }
            : {}),
        },
        select: {
          id: true,
        },
      });

      if (shouldRevokeSessions) {
        await tx.userSession.deleteMany({
          where: {
            userId: updated.id,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: updated.id },
        select: adminUserSelect,
      });
    });

    return NextResponse.json({
      user: toAdminUserResponse(updatedUser as AdminUserRow),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản khách hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
