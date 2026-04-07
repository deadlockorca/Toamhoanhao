import { NextResponse } from "next/server";

import {
  adminCollectionSelect,
  parseCollectionInput,
  resolveCollectionSlug,
  toAdminCollectionResponse,
  type AdminCollectionRow,
} from "@/lib/admin-collection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_COLLECTION_LIMIT = 120;
const MAX_COLLECTION_LIMIT = 200;
const DEFAULT_PRODUCT_LIMIT = 150;
const MAX_PRODUCT_LIMIT = 300;

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

const ensureProductsExist = async (productIds: string[]) => {
  if (productIds.length === 0) {
    return true;
  }

  const count = await prisma.product.count({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  return count === productIds.length;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const collectionLimit = parsePositiveInt(
      url.searchParams.get("collectionLimit"),
      DEFAULT_COLLECTION_LIMIT,
      MAX_COLLECTION_LIMIT,
    );
    const productLimit = parsePositiveInt(
      url.searchParams.get("productLimit"),
      DEFAULT_PRODUCT_LIMIT,
      MAX_PRODUCT_LIMIT,
    );

    const [collections, products] = await Promise.all([
      prisma.collection.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: collectionLimit,
        select: adminCollectionSelect,
      }),
      prisma.product.findMany({
        orderBy: [{ name: "asc" }],
        take: productLimit,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      }),
    ]);

    return NextResponse.json({
      collections: (collections as AdminCollectionRow[]).map(toAdminCollectionResponse),
      products,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị bộ sưu tập.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseCollectionInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const productsExist = await ensureProductsExist(parsed.data.productIds);
    if (!productsExist) {
      return NextResponse.json({ error: "Có sản phẩm không tồn tại trong bộ sưu tập." }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const slug = await resolveCollectionSlug(tx, parsed.data.slugInput, parsed.data.name);

      const collection = await tx.collection.create({
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          imageUrl: parsed.data.imageUrl,
          isActive: parsed.data.isActive,
          sortOrder: parsed.data.sortOrder,
        },
        select: {
          id: true,
        },
      });

      if (parsed.data.productIds.length > 0) {
        await tx.collectionItem.createMany({
          data: parsed.data.productIds.map((productId, index) => ({
            collectionId: collection.id,
            productId,
            sortOrder: index,
          })),
          skipDuplicates: true,
        });
      }

      return tx.collection.findUniqueOrThrow({
        where: {
          id: collection.id,
        },
        select: adminCollectionSelect,
      });
    });

    return NextResponse.json(
      { collection: toAdminCollectionResponse(created as AdminCollectionRow) },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo bộ sưu tập.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
