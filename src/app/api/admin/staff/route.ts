import { NextResponse } from "next/server";

import {
  createAdminStaffAccount,
  listAdminStaffAccounts,
  parseCreateAdminStaffInput,
} from "@/lib/admin-staff";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await listAdminStaffAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải danh sách tài khoản nhân sự.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseCreateAdminStaffInput(payload);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const account = await createAdminStaffAccount(parsed.data);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo tài khoản nhân sự.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
