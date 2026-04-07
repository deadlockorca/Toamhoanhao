import { NextResponse } from "next/server";

import { parseProductInput, slugify } from "@/lib/admin-product";
import { prisma } from "@/lib/prisma";
import { deleteImagesFromR2ByUrls } from "@/lib/r2";

export const dynamic = "force-dynamic";

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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = parseProductInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
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
    const uniqueSlug = await resolveUniqueSlug(slugBase, id);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: uniqueSlug,
          imageUrl: parsed.data.imageUrl,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          price: parsed.data.price,
          originalPrice: parsed.data.originalPrice,
          badge: parsed.data.badge,
          tab: parsed.data.tab,
          inStock: parsed.data.inStock,
          isFeatured: parsed.data.isFeatured,
          categoryId: parsed.data.categoryId,
        },
      });

      await tx.productImage.deleteMany({
        where: {
          productId: id,
          variantId: null,
        },
      });

      if (parsed.data.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: parsed.data.imageUrls.map((url, index) => ({
            productId: id,
            variantId: null,
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        });
      }

      await tx.productSpec.deleteMany({
        where: {
          productId: id,
        },
      });

      if (parsed.data.specs.length > 0) {
        await tx.productSpec.createMany({
          data: parsed.data.specs.map((spec) => ({
            productId: id,
            name: spec.name,
            value: spec.value,
            sortOrder: spec.sortOrder,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        select: productSelect,
      });
    });

    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return NextResponse.json({ product: toProductResponse(updated as ProductRow) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật sản phẩm.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
        images: {
          select: {
            url: true,
          },
        },
        variants: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    const imageUrlsToDelete = Array.from(
      new Set(
        [
          existingProduct.imageUrl,
          ...existingProduct.images.map((image) => image.url),
          ...existingProduct.variants.map((variant) => variant.imageUrl),
        ].filter((url): url is string => Boolean(url && url.trim()))
      )
    );

    await prisma.product.delete({
      where: { id },
    });

    const [productImageRefs, productGalleryRefs, variantImageRefs] = await Promise.all([
      prisma.product.findMany({
        where: {
          imageUrl: {
            in: imageUrlsToDelete,
          },
        },
        select: {
          imageUrl: true,
        },
      }),
      prisma.productImage.findMany({
        where: {
          url: {
            in: imageUrlsToDelete,
          },
        },
        select: {
          url: true,
        },
      }),
      prisma.productVariant.findMany({
        where: {
          imageUrl: {
            in: imageUrlsToDelete,
          },
        },
        select: {
          imageUrl: true,
        },
      }),
    ]);

    const stillReferencedUrls = new Set<string>([
      ...productImageRefs
        .map((item) => item.imageUrl)
        .filter((url): url is string => Boolean(url && url.trim())),
      ...productGalleryRefs
        .map((item) => item.url)
        .filter((url): url is string => Boolean(url && url.trim())),
      ...variantImageRefs
        .map((item) => item.imageUrl)
        .filter((url): url is string => Boolean(url && url.trim())),
    ]);

    const deletableImageUrls = imageUrlsToDelete.filter((url) => !stillReferencedUrls.has(url));

    try {
      const r2Cleanup = await deleteImagesFromR2ByUrls(deletableImageUrls);
      return NextResponse.json({
        success: true,
        r2Cleanup,
        keptSharedUrls: stillReferencedUrls.size,
      });
    } catch (error) {
      const warning =
        error instanceof Error
          ? error.message
          : "Đã xóa sản phẩm nhưng chưa xóa được ảnh trên R2.";

      return NextResponse.json({
        success: true,
        warning,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xóa sản phẩm.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
