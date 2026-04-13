import { BannerKind, ProductStatus, ProductTab } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const defaultProductImage = "/products/p1.jpg";

export type PublicProductCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
  imageUrls: string[];
  price: number;
  originalPrice: number | null;
  badge: string | null;
};

const publicProductSelect = {
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
};

type PublicProductRow = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  images: Array<{
    url: string;
  }>;
};

const toPublicProductCard = (product: PublicProductRow): PublicProductCard => {
  const imageUrls = product.images.map((item) => item.url).filter(Boolean).slice(0, 5);
  const primaryImage = imageUrls[0] ?? product.imageUrl ?? defaultProductImage;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: primaryImage,
    imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImage],
    price: product.price,
    originalPrice: product.originalPrice,
    badge: product.badge,
  };
};

const publicProductWhere = {
  inStock: true,
  isPublished: true,
  status: ProductStatus.ACTIVE,
};

const normalizePublicSearchQuery = (value: string) =>
  value.trim().replace(/\s+/g, " ").slice(0, 120);

const getSearchTokens = (query: string) =>
  normalizePublicSearchQuery(query)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

export const getNewProducts = async (take = 36) => {
  const products = await prisma.product.findMany({
    where: {
      ...publicProductWhere,
      tab: ProductTab.NEW,
    },
    orderBy: [{ createdAt: "desc" }],
    take,
    select: publicProductSelect,
  });

  return products.map((product) => toPublicProductCard(product));
};

export const getBestProducts = async (take = 36) => {
  const products = await prisma.product.findMany({
    where: {
      ...publicProductWhere,
      OR: [
        { tab: ProductTab.BEST },
        { totalSold: { gt: 0 } },
        {
          category: {
            is: {
              slug: "ban-chay-nhat",
            },
          },
        },
      ],
    },
    orderBy: [{ totalSold: "desc" }, { createdAt: "desc" }],
    take,
    select: publicProductSelect,
  });

  return products.map((product) => toPublicProductCard(product));
};

export const getSaleProducts = async (take = 36) => {
  const products = await prisma.product.findMany({
    where: {
      ...publicProductWhere,
      OR: [{ tab: ProductTab.SALE }, { originalPrice: { not: null } }],
    },
    orderBy: [{ createdAt: "desc" }],
    take,
    select: publicProductSelect,
  });

  return products.map((product) => toPublicProductCard(product));
};

export type PublicCollectionCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  itemCount: number;
};

export type PublicCategoryBanner = {
  imageUrl: string;
  title: string;
  subtitle: string | null;
};

export type PublicSidebarCategoryLink = {
  name: string;
  slug: string;
};

export const getActiveCategoryBanner = async (): Promise<PublicCategoryBanner | null> => {
  const banner = await prisma.banner.findFirst({
    where: {
      isActive: true,
      kind: BannerKind.CATEGORY,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      imageUrl: true,
      title: true,
      subtitle: true,
    },
  });

  if (!banner?.imageUrl?.trim()) {
    return null;
  }

  return {
    imageUrl: banner.imageUrl.trim(),
    title: banner.title,
    subtitle: banner.subtitle,
  };
};

export const getPublicSidebarCategoryLinks = async (take = 36): Promise<PublicSidebarCategoryLink[]> => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take,
    select: {
      name: true,
      slug: true,
    },
  });

  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));
};

export const getActiveCollections = async (take = 30) => {
  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    imageUrl: collection.imageUrl,
    itemCount: collection._count.items,
  }));
};

export type PublicCollectionDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export const getCollectionBySlug = async (slug: string): Promise<PublicCollectionDetail | null> => {
  return prisma.collection.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
    },
  });
};

export const getProductsByCollectionId = async (collectionId: string, take = 48) => {
  const items = await prisma.collectionItem.findMany({
    where: {
      collectionId,
      product: {
        is: publicProductWhere,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take,
    select: {
      product: {
        select: publicProductSelect,
      },
    },
  });

  return items.map((item) => toPublicProductCard(item.product));
};

export type HeaderCollectionLink = {
  name: string;
  slug: string;
};

export type PublicCategoryDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

const getCategoryAndDescendantIds = (
  allCategories: Array<{
    id: string;
    parentId: string | null;
  }>,
  rootCategoryId: string,
) => {
  const categoryIds = new Set<string>([rootCategoryId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const category of allCategories) {
      if (!category.parentId) {
        continue;
      }

      if (categoryIds.has(category.parentId) && !categoryIds.has(category.id)) {
        categoryIds.add(category.id);
        changed = true;
      }
    }
  }

  return Array.from(categoryIds);
};

export const getCategoryBySlug = async (slug: string): Promise<PublicCategoryDetail | null> => {
  return prisma.category.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });
};

export const getProductsByCategorySlug = async (slug: string, take = 96) => {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return null;
  }

  const allCategories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      parentId: true,
    },
  });

  const categoryIds = getCategoryAndDescendantIds(allCategories, category.id);

  const products = await prisma.product.findMany({
    where: {
      ...publicProductWhere,
      categoryId: {
        in: categoryIds,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take,
    select: publicProductSelect,
  });

  return {
    category,
    products: products.map((product) => toPublicProductCard(product)),
  };
};

export const searchPublicProducts = async (query: string, take = 120) => {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) {
    return [] as PublicProductCard[];
  }

  const products = await prisma.product.findMany({
    where: {
      ...publicProductWhere,
      AND: tokens.map((token) => ({
        OR: [
          { name: { contains: token } },
          { slug: { contains: token } },
          { badge: { contains: token } },
          {
            category: {
              is: {
                name: { contains: token },
              },
            },
          },
          {
            category: {
              is: {
                slug: { contains: token },
              },
            },
          },
        ],
      })),
    },
    orderBy: [{ totalSold: "desc" }, { createdAt: "desc" }],
    take,
    select: publicProductSelect,
  });

  return products.map((product) => toPublicProductCard(product));
};

export const countPublicSearchProducts = async (query: string) => {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) {
    return 0;
  }

  return prisma.product.count({
    where: {
      ...publicProductWhere,
      AND: tokens.map((token) => ({
        OR: [
          { name: { contains: token } },
          { slug: { contains: token } },
          { badge: { contains: token } },
          {
            category: {
              is: {
                name: { contains: token },
              },
            },
          },
          {
            category: {
              is: {
                slug: { contains: token },
              },
            },
          },
        ],
      })),
    },
  });
};

export const getHeaderCollectionLinks = async (take = 8): Promise<HeaderCollectionLink[]> => {
  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take,
    select: {
      name: true,
      slug: true,
    },
  });

  return collections.map((collection) => ({
    name: collection.name,
    slug: collection.slug,
  }));
};
