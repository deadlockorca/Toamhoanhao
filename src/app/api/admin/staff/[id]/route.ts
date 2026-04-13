import { NextResponse } from "next/server";

import {
  deleteAdminStaffAccount,
  parseUpdateAdminStaffInput,
  updateAdminStaffAccount,
} from "@/lib/admin-staff";

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
    const parsed = parseUpdateAdminStaffInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const account = await updateAdminStaffAccount(id, parsed.data);
    return NextResponse.json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản nhân sự.";
    const status = message.includes("Không tìm thấy") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const account = await deleteAdminStaffAccount(id);
    return NextResponse.json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa tài khoản nhân sự.";
    const status = message.includes("Không tìm thấy") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
