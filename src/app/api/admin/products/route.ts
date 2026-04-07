import { NextResponse } from "next/server";
import { Prisma, ProductTab } from "@prisma/client";

import { parseProductInput, slugify } from "@/lib/admin-product";
import { defaultCategories } from "@/lib/default-categories";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
  shortDescription: true,
  description: true,
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
  tab: true,
  inStock: true,
  isFeatured: true,
  categoryId: true,
  specs: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      name: true,
      value: true,
      sortOrder: true,
    },
  },
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  shortDescription: string | null;
  description: string | null;
  images: Array<{
    url: string;
  }>;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  tab: "NEW" | "BEST" | "SALE";
  inStock: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  specs: Array<{
    id: string;
    name: string;
    value: string;
    sortOrder: number;
  }>;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

const toProductResponse = (product: ProductRow) => {
  const imageUrls = product.images.map((image) => image.url).filter(Boolean).slice(0, 5);
  const primaryImageUrl = imageUrls[0] ?? product.imageUrl;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: primaryImageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : primaryImageUrl ? [primaryImageUrl] : [],
    shortDescription: product.shortDescription,
    description: product.description,
    specs: product.specs,
    showContactPrice: isContactPrice(product.price, product.originalPrice),
    price: product.price,
    originalPrice: product.originalPrice,
    badge: product.badge,
    tab: product.tab,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    createdAt: product.createdAt.toISOString(),
  };
};

const parsePositiveInt = (raw: string | null, fallback: number) => {
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
};

const parseTabFilter = (raw: string | null): ProductTab | null => {
  if (!raw) {
    return null;
  }

  const value = raw.trim().toUpperCase();
  if (value === ProductTab.NEW || value === ProductTab.BEST || value === ProductTab.SALE) {
    return value as ProductTab;
  }

  return null;
};

const getListParams = (url: URL) => {
  const page = parsePositiveInt(url.searchParams.get("page"), DEFAULT_PAGE);
  const requestedLimit = parsePositiveInt(url.searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const search = (url.searchParams.get("search") ?? "").trim();
  const categoryId = (url.searchParams.get("categoryId") ?? "").trim();
  const tab = parseTabFilter(url.searchParams.get("tab"));

  return {
    page,
    limit,
    search,
    categoryId,
    tab,
  };
};

const resolveUniqueSlug = async (baseSlug: string, excludeId?: string) => {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
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

const ensureDefaultCategories = async () => {
  const existingCount = await prisma.category.count();
  if (existingCount > 0) {
    return;
  }

  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      isActive: true,
    })),
    skipDuplicates: true,
  });
};

export async function GET(request: Request) {
  try {
    await ensureDefaultCategories();

    const params = getListParams(new URL(request.url));
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
          },
        },
        {
          slug: {
            contains: params.search,
          },
        },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.tab) {
      where.tab = params.tab;
    }

    const total = await prisma.product.count({
      where,
    });
    const totalPages = Math.max(1, Math.ceil(total / params.limit));
    const safePage = Math.min(params.page, totalPages);
    const skip = (safePage - 1) * params.limit;

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: params.limit,
        select: productSelect,
      }),
      prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    return NextResponse.json({
      products: (products as ProductRow[]).map(toProductResponse),
      categories,
      pagination: {
        page: safePage,
        limit: params.limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
      filters: {
        search: params.search,
        categoryId: params.categoryId,
        tab: params.tab,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseProductInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: parsed.data.categoryId,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        return NextResponse.json({ error: "Danh mục không tồn tại." }, { status: 400 });
      }
    }

    const slugBase = slugify(parsed.data.slugInput || parsed.data.name);
    const uniqueSlug = await resolveUniqueSlug(slugBase);

    const created = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: uniqueSlug,
        imageUrl: parsed.data.imageUrl,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        images:
          parsed.data.imageUrls.length > 0
            ? {
                create: parsed.data.imageUrls.map((url, index) => ({
                  url,
                  isPrimary: index === 0,
                  sortOrder: index,
                })),
              }
            : undefined,
        specs:
          parsed.data.specs.length > 0
            ? {
                create: parsed.data.specs.map((spec) => ({
                  name: spec.name,
                  value: spec.value,
                  sortOrder: spec.sortOrder,
                })),
              }
            : undefined,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice,
        badge: parsed.data.badge,
        tab: parsed.data.tab,
        inStock: parsed.data.inStock,
        isFeatured: parsed.data.isFeatured,
        categoryId: parsed.data.categoryId,
      },
      select: productSelect,
    });

    return NextResponse.json({ product: toProductResponse(created as ProductRow) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo sản phẩm.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
