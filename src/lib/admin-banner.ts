import { BannerKind, Prisma } from "@prisma/client";

import { toBoolean, toCleanString, toInteger, toRecord } from "@/lib/admin-parser";
import { slugify } from "@/lib/admin-product";

export const adminBannerSelect = {
  id: true,
  slug: true,
  kind: true,
  title: true,
  subtitle: true,
  imageUrl: true,
  ctaLabel: true,
  ctaHref: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BannerSelect;

export type AdminBannerRow = Prisma.BannerGetPayload<{
  select: typeof adminBannerSelect;
}>;

export const toAdminBannerResponse = (banner: AdminBannerRow) => ({
  id: banner.id,
  slug: banner.slug,
  kind: banner.kind,
  title: banner.title,
  subtitle: banner.subtitle,
  imageUrl: banner.imageUrl,
  ctaLabel: banner.ctaLabel,
  ctaHref: banner.ctaHref,
  sortOrder: banner.sortOrder,
  isActive: banner.isActive,
  createdAt: banner.createdAt.toISOString(),
  updatedAt: banner.updatedAt.toISOString(),
});

export type BannerInput = {
  title: string;
  slugInput: string;
  kind: BannerKind;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
};

export const parseBannerInput = (
  input: unknown
): { ok: true; data: BannerInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const title = toCleanString(payload.title, 191);
  if (!title) {
    return { ok: false, error: "Tiêu đề banner là bắt buộc." };
  }

const imageUrl = toCleanString(payload.imageUrl, 500);
  if (!imageUrl) {
    return { ok: false, error: "Ảnh banner là bắt buộc." };
  }

  const kindRaw = toCleanString(payload.kind, 20)?.toUpperCase();
  const kind = kindRaw === BannerKind.POPUP ? BannerKind.POPUP : BannerKind.HERO;

  return {
    ok: true,
    data: {
      title,
      slugInput: toCleanString(payload.slug, 191) ?? "",
      kind,
      subtitle: toCleanString(payload.subtitle, 191),
      imageUrl,
      ctaLabel: toCleanString(payload.ctaLabel, 120),
      ctaHref: toCleanString(payload.ctaHref, 500),
      sortOrder: toInteger(payload.sortOrder) ?? 0,
      isActive: toBoolean(payload.isActive, true),
    },
  };
};

export const resolveBannerSlug = async (
  tx: Prisma.TransactionClient | PrismaClientLike,
  slugInput: string,
  title: string,
  excludeId?: string
) => {
  const baseSlug = slugify(slugInput || title || "banner");
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await tx.banner.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

type PrismaClientLike = {
  banner: {
    findFirst(args: Prisma.BannerFindFirstArgs): Promise<{ id: string } | null>;
  };
};
