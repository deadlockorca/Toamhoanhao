import { NextResponse } from "next/server";

import { uploadImageToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type không hợp lệ. Vui lòng gửi multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const fileValue = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Thiếu file ảnh." }, { status: 400 });
    }

    const folder = typeof folderValue === "string" ? folderValue : undefined;
    const uploaded = await uploadImageToR2({
      file: fileValue,
      folder,
    });

    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    const message = toErrorMessage(error, "Không thể tải ảnh lên R2.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

