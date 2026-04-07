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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = parseCollectionInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const [existingCollection, productsExist] = await Promise.all([
      prisma.collection.findUnique({
        where: { id },
        select: { id: true },
      }),
      ensureProductsExist(parsed.data.productIds),
    ]);

    if (!existingCollection) {
      return NextResponse.json({ error: "Không tìm thấy bộ sưu tập." }, { status: 404 });
    }

    if (!productsExist) {
      return NextResponse.json({ error: "Có sản phẩm không tồn tại trong bộ sưu tập." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const slug = await resolveCollectionSlug(tx, parsed.data.slugInput, parsed.data.name, id);

      await tx.collection.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          imageUrl: parsed.data.imageUrl,
          isActive: parsed.data.isActive,
          sortOrder: parsed.data.sortOrder,
        },
      });

      await tx.collectionItem.deleteMany({
        where: {
          collectionId: id,
        },
      });

      if (parsed.data.productIds.length > 0) {
        await tx.collectionItem.createMany({
          data: parsed.data.productIds.map((productId, index) => ({
            collectionId: id,
            productId,
            sortOrder: index,
          })),
          skipDuplicates: true,
        });
      }

      return tx.collection.findUniqueOrThrow({
        where: { id },
        select: adminCollectionSelect,
      });
    });

    return NextResponse.json({
      collection: toAdminCollectionResponse(updated as AdminCollectionRow),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật bộ sưu tập.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingCollection = await prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: "Không tìm thấy bộ sưu tập." }, { status: 404 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa bộ sưu tập.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

