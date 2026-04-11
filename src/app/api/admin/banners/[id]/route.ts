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
import { deleteImagesFromR2ByUrls } from "@/lib/r2";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const cleanUrl = (value: string | null | undefined) => value?.trim() ?? "";

const cleanupBannerImageIfUnused = async (imageUrl: string) => {
  const normalized = cleanUrl(imageUrl);
  if (!normalized) {
    return {};
  }

  const stillReferencedCount = await prisma.banner.count({
    where: {
      imageUrl: normalized,
    },
  });

  if (stillReferencedCount > 0) {
    return {
      keptSharedUrls: stillReferencedCount,
    };
  }

  try {
    const r2Cleanup = await deleteImagesFromR2ByUrls([normalized]);
    return {
      r2Cleanup,
    };
  } catch (error) {
    const warning =
      error instanceof Error
        ? error.message
        : "Đã lưu banner nhưng chưa xóa được ảnh cũ trên R2.";
    return { warning };
  }
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = parseBannerInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await ensureBannerKindSchema();

    const existingBanner = await prisma.banner.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Không tìm thấy banner." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const slug = await resolveBannerSlug(tx, parsed.data.slugInput, parsed.data.title, id);

      if (parsed.data.kind === BannerKind.CATEGORY && parsed.data.isActive) {
        await tx.banner.updateMany({
          where: {
            kind: BannerKind.CATEGORY,
            isActive: true,
            NOT: {
              id,
            },
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.banner.update({
        where: { id },
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

    const previousImageUrl = cleanUrl(existingBanner.imageUrl);
    const nextImageUrl = cleanUrl(updated.imageUrl);

    const cleanupPayload =
      previousImageUrl && previousImageUrl !== nextImageUrl
        ? await cleanupBannerImageIfUnused(previousImageUrl)
        : {};

    return NextResponse.json({
      banner: toAdminBannerResponse(updated as AdminBannerRow),
      ...cleanupPayload,
    });
  } catch (error) {
    const message = toBannerSchemaErrorMessage(error, "Không thể cập nhật banner.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingBanner = await prisma.banner.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Không tìm thấy banner." }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    const cleanupPayload = await cleanupBannerImageIfUnused(existingBanner.imageUrl);

    return NextResponse.json({
      success: true,
      ...cleanupPayload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
