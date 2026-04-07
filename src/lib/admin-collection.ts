import { Prisma } from "@prisma/client";

import { toBoolean, toCleanString, toInteger, toRecord, toStringArray } from "@/lib/admin-parser";
import { slugify } from "@/lib/admin-product";

export const adminCollectionSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: [{ sortOrder: "asc" }],
    select: {
      id: true,
      productId: true,
      sortOrder: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      },
    },
  },
} satisfies Prisma.CollectionSelect;

export type AdminCollectionRow = Prisma.CollectionGetPayload<{
  select: typeof adminCollectionSelect;
}>;

export const toAdminCollectionResponse = (collection: AdminCollectionRow) => ({
  id: collection.id,
  name: collection.name,
  slug: collection.slug,
  description: collection.description,
  imageUrl: collection.imageUrl,
  isActive: collection.isActive,
  sortOrder: collection.sortOrder,
  itemCount: collection.items.length,
  items: collection.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    productImageUrl: item.product.imageUrl,
    productPrice: item.product.price,
    sortOrder: item.sortOrder,
  })),
  createdAt: collection.createdAt.toISOString(),
  updatedAt: collection.updatedAt.toISOString(),
});

export type CollectionInput = {
  name: string;
  slugInput: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  productIds: string[];
};

export const parseCollectionInput = (
  input: unknown
): { ok: true; data: CollectionInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const name = toCleanString(payload.name, 191);
  if (!name) {
    return { ok: false, error: "Tên bộ sưu tập là bắt buộc." };
  }

  const rawProductIds = toStringArray(payload.productIds, 191);
  const uniqueProductIds = Array.from(new Set(rawProductIds));

  return {
    ok: true,
    data: {
      name,
      slugInput: toCleanString(payload.slug, 191) ?? "",
      description: toCleanString(payload.description, 500),
      imageUrl: toCleanString(payload.imageUrl, 500),
      isActive: toBoolean(payload.isActive, true),
      sortOrder: toInteger(payload.sortOrder) ?? 0,
      productIds: uniqueProductIds,
    },
  };
};

export const resolveCollectionSlug = async (
  tx: Prisma.TransactionClient | PrismaClientLike,
  slugInput: string,
  name: string,
  excludeId?: string
) => {
  const baseSlug = slugify(slugInput || name);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await tx.collection.findFirst({
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
  collection: {
    findFirst(args: Prisma.CollectionFindFirstArgs): Promise<{ id: string } | null>;
  };
};

