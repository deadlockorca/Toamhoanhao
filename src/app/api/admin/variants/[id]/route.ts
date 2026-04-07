import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  adminVariantSelect,
  parseVariantInput,
  toAdminVariantResponse,
  type AdminVariantRow,
} from "@/lib/admin-variant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const syncProductInStock = async (tx: Prisma.TransactionClient, productId: string) => {
  const availableCount = await tx.productVariant.count({
    where: {
      productId,
      isActive: true,
      inStock: true,
      stockQuantity: {
        gt: 0,
      },
    },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      inStock: availableCount > 0,
    },
  });
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
    const parsed = parseVariantInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const [existingVariant, product] = await Promise.all([
      prisma.productVariant.findUnique({
        where: { id },
        select: { id: true, productId: true },
      }),
      prisma.product.findUnique({
        where: { id: parsed.data.productId },
        select: { id: true },
      }),
    ]);

    if (!existingVariant) {
      return NextResponse.json({ error: "Không tìm thấy biến thể." }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.productVariant.updateMany({
          where: {
            productId: parsed.data.productId,
            NOT: { id },
          },
          data: {
            isDefault: false,
          },
        });
      }

      const variant = await tx.productVariant.update({
        where: { id },
        data: parsed.data,
        select: adminVariantSelect,
      });

      await syncProductInStock(tx, parsed.data.productId);

      if (existingVariant.productId !== parsed.data.productId) {
        await syncProductInStock(tx, existingVariant.productId);
      }

      return variant;
    });

    return NextResponse.json({
      variant: toAdminVariantResponse(updated as AdminVariantRow),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "SKU biến thể đã tồn tại. Vui lòng dùng SKU khác." },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Không thể cập nhật biến thể.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
      select: {
        id: true,
        productId: true,
      },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Không tìm thấy biến thể." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({
        where: { id },
      });
      await syncProductInStock(tx, existingVariant.productId);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa biến thể.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

