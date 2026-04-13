import { NextResponse } from "next/server";

import {
  getAllowedAdminSections,
  getDefaultAdminPathByRole,
  getRoleLabel,
  isAdminRole,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const roleValue = request.headers.get("x-admin-role");
  const username = request.headers.get("x-admin-username");

  if (!isAdminRole(roleValue)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    role: roleValue,
    roleLabel: getRoleLabel(roleValue),
    username: username ?? "",
    sections: getAllowedAdminSections(roleValue),
    defaultPath: getDefaultAdminPathByRole(roleValue),
  });
}
