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

const DEFAULT_VARIANT_LIMIT = 200;
const MAX_VARIANT_LIMIT = 500;
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const variantLimit = parsePositiveInt(
      url.searchParams.get("variantLimit"),
      DEFAULT_VARIANT_LIMIT,
      MAX_VARIANT_LIMIT,
    );
    const productLimit = parsePositiveInt(
      url.searchParams.get("productLimit"),
      DEFAULT_PRODUCT_LIMIT,
      MAX_PRODUCT_LIMIT,
    );

    const [variants, products] = await Promise.all([
      prisma.productVariant.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: variantLimit,
        select: adminVariantSelect,
      }),
      prisma.product.findMany({
        orderBy: [{ name: "asc" }],
        take: productLimit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          imageUrl: true,
        },
      }),
    ]);

    return NextResponse.json({
      variants: (variants as AdminVariantRow[]).map(toAdminVariantResponse),
      products,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị biến thể.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseVariantInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại." }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.productVariant.updateMany({
          where: {
            productId: parsed.data.productId,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const variant = await tx.productVariant.create({
        data: parsed.data,
        select: adminVariantSelect,
      });

      await syncProductInStock(tx, parsed.data.productId);
      return variant;
    });

    return NextResponse.json(
      { variant: toAdminVariantResponse(created as AdminVariantRow) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "SKU biến thể đã tồn tại. Vui lòng dùng SKU khác." },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Không thể tạo biến thể.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
