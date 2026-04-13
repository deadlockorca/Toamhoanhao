import { NextResponse } from "next/server";

import { isAdminRole, parseBasicAuth } from "@/lib/admin-auth";
import { verifyAdminStaffCredential } from "@/lib/admin-staff";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = parseBasicAuth(request.headers.get("authorization"));
  if (!parsed) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const identity = await verifyAdminStaffCredential(parsed.username, parsed.password);
    if (!identity || !isAdminRole(identity.role)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      role: identity.role,
      username: identity.username,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
