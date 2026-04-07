import { ProductTab } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const tabMap = {
  new: ProductTab.NEW,
  best: ProductTab.BEST,
  sale: ProductTab.SALE,
} as const;

const defaultTake = 8;

const toProductResponse = (product: {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  images: Array<{
    url: string;
  }>;
  price: number;
  originalPrice: number | null;
  badge: string | null;
}) => {
  const imageUrls = product.images.map((image) => image.url).filter(Boolean).slice(0, 5);
  const primaryImage = imageUrls[0] ?? product.imageUrl ?? "/products/p1.jpg";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: primaryImage,
    imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImage],
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    badge: product.badge ?? undefined,
  };
};

const parseTake = (value: string | null) => {
  if (!value) {
    return defaultTake;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultTake;
  }

  return Math.min(parsed, 24);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tab = url.searchParams.get("tab") as keyof typeof tabMap | null;
    const take = parseTake(url.searchParams.get("take"));

    if (tab && tab in tabMap) {
      const products = await prisma.product.findMany({
        where: {
          tab: tabMap[tab],
          inStock: true,
        },
        orderBy: [{ createdAt: "desc" }],
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: {
            where: {
              variantId: null,
            },
            orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
            take: 5,
            select: {
              url: true,
            },
          },
          price: true,
          originalPrice: true,
          badge: true,
        },
      });

      return NextResponse.json({
        [tab]: products.map(toProductResponse),
      });
    }

    const [newProducts, bestProducts, saleProducts] = await Promise.all([
      prisma.product.findMany({
        where: { tab: ProductTab.NEW, inStock: true },
        orderBy: [{ createdAt: "desc" }],
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: {
            where: {
              variantId: null,
            },
            orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
            take: 5,
            select: {
              url: true,
            },
          },
          price: true,
          originalPrice: true,
          badge: true,
        },
      }),
      prisma.product.findMany({
        where: { tab: ProductTab.BEST, inStock: true },
        orderBy: [{ createdAt: "desc" }],
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: {
            where: {
              variantId: null,
            },
            orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
            take: 5,
            select: {
              url: true,
            },
          },
          price: true,
          originalPrice: true,
          badge: true,
        },
      }),
      prisma.product.findMany({
        where: { tab: ProductTab.SALE, inStock: true },
        orderBy: [{ createdAt: "desc" }],
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: {
            where: {
              variantId: null,
            },
            orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
            take: 5,
            select: {
              url: true,
            },
          },
          price: true,
          originalPrice: true,
          badge: true,
        },
      }),
    ]);

    return NextResponse.json({
      new: newProducts.map(toProductResponse),
      best: bestProducts.map(toProductResponse),
      sale: saleProducts.map(toProductResponse),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while loading products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
