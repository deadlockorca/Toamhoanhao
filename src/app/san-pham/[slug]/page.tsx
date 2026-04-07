import { ProductStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import ProductDetailView from "@/components/ProductDetailView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const DEFAULT_SITE_PHONE = "0901.827.555";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const parseJsonSetting = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
};

const normalizeSitePhone = (value: unknown): string => {
  if (typeof value !== "string") {
    return DEFAULT_SITE_PHONE;
  }

  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly) {
    return DEFAULT_SITE_PHONE;
  }

  // Migrate legacy hotline values to the new number.
  if (digitsOnly === "0903897555" || digitsOnly === "0901827555") {
    return DEFAULT_SITE_PHONE;
  }

  return trimmed;
};

const normalizeImageList = (items: Array<string | null | undefined>) => {
  const imageUrls: string[] = [];
  for (const item of items) {
    const url = (item ?? "").trim();
    if (!url || imageUrls.includes(url)) {
      continue;
    }
    imageUrls.push(url);
    if (imageUrls.length >= 5) {
      break;
    }
  }
  return imageUrls;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isPublished: true,
      status: ProductStatus.ACTIVE,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      badge: true,
      shortDescription: true,
      description: true,
      price: true,
      originalPrice: true,
      inStock: true,
      imageUrl: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
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
      specs: {
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
        select: {
          id: true,
          name: true,
          value: true,
        },
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: [
          { isDefault: "desc" as const },
          { sortOrder: "asc" as const },
          { createdAt: "asc" as const },
        ],
        select: {
          id: true,
          name: true,
          option1: true,
          option2: true,
          option3: true,
          imageUrl: true,
          price: true,
          originalPrice: true,
          inStock: true,
          isDefault: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const [contactSetting, relatedProducts] = await Promise.all([
    prisma.siteSetting.findUnique({
      where: {
        key: "contact",
      },
      select: {
        value: true,
      },
    }),
    prisma.product.findMany({
      where: {
        id: {
          not: product.id,
        },
        inStock: true,
        isPublished: true,
        status: ProductStatus.ACTIVE,
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      take: 4,
      orderBy: [{ createdAt: "desc" as const }],
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
        price: true,
        originalPrice: true,
        badge: true,
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
      },
    }),
  ]);

  const contact = parseJsonSetting(contactSetting?.value);
  const rawSitePhone =
    (typeof contact?.phone === "string" && contact.phone.trim()) ||
    (typeof contact?.hotline === "string" && contact.hotline.trim()) ||
    undefined;
  const sitePhone = normalizeSitePhone(rawSitePhone);

  const imageUrls = normalizeImageList([
    ...product.images.map((image) => image.url),
    product.imageUrl,
    ...product.variants.map((variant) => variant.imageUrl),
  ]);

  const related = relatedProducts.map((item) => {
    const firstImage = normalizeImageList([...item.images.map((image) => image.url), item.imageUrl])[0];
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      image: firstImage ?? "/products/p1.jpg",
      price: item.price,
      originalPrice: item.originalPrice,
      badge: item.badge,
    };
  });

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />
      <ProductDetailView
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          badge: product.badge,
          categoryName: product.category?.name ?? null,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          inStock: product.inStock,
          imageUrls: imageUrls.length > 0 ? imageUrls : ["/products/p1.jpg"],
          variants: product.variants,
          specs: product.specs,
        }}
        relatedProducts={related}
        sitePhone={sitePhone}
      />
      <SiteFooter sitePhone={sitePhone} />
    </div>
  );
}
