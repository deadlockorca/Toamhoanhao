import { NextResponse } from "next/server";
import { BannerKind } from "@prisma/client";

import {
  adminBannerSelect,
  parseBannerInput,
  resolveBannerSlug,
  toAdminBannerResponse,
  type AdminBannerRow,
} from "@/lib/admin-banner";
import { ensureBannerKindSchema, toBannerSchemaErrorMessage } from "@/lib/banner-schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_BANNER_LIMIT = 120;
const MAX_BANNER_LIMIT = 300;

const parsePositiveInt = (raw: string | null, fallback: number, max: number) => {
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(value), max);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parsePositiveInt(url.searchParams.get("limit"), DEFAULT_BANNER_LIMIT, MAX_BANNER_LIMIT);

    const banners = await prisma.banner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: adminBannerSelect,
    });

    return NextResponse.json({
      banners: (banners as AdminBannerRow[]).map(toAdminBannerResponse),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải dữ liệu banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseBannerInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await ensureBannerKindSchema();

    const created = await prisma.$transaction(async (tx) => {
      const slug = await resolveBannerSlug(tx, parsed.data.slugInput, parsed.data.title);

      if (parsed.data.kind === BannerKind.CATEGORY && parsed.data.isActive) {
        await tx.banner.updateMany({
          where: {
            kind: BannerKind.CATEGORY,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.banner.create({
        data: {
          slug,
          kind: parsed.data.kind,
          title: parsed.data.title,
          subtitle: parsed.data.subtitle,
          imageUrl: parsed.data.imageUrl,
          ctaLabel: parsed.data.ctaLabel,
          ctaHref: parsed.data.ctaHref,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: adminBannerSelect,
      });
    });

    return NextResponse.json(
      { banner: toAdminBannerResponse(created as AdminBannerRow) },
      { status: 201 }
    );
  } catch (error) {
    const message = toBannerSchemaErrorMessage(error, "Không thể tạo banner.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
