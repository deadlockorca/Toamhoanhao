import { NextResponse } from "next/server";
import { BannerKind } from "@prisma/client";

import { defaultCategories } from "@/lib/default-categories";
import { prisma } from "@/lib/prisma";
import {
  getBestProducts,
  getHeaderCollectionLinks,
  getNewProducts,
  getProductsByCategorySlug,
  getSaleProducts,
} from "@/lib/public-catalog";

export const dynamic = "force-dynamic";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
};

const defaultTake = 8;
const DEFAULT_SITE_PHONE = "0901.827.555";
let didEnsureDefaultCategories = false;

type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeNode[];
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

const ensureDefaultCategories = async () => {
  if (didEnsureDefaultCategories) {
    return;
  }

  const existingCount = await prisma.category.count();
  if (existingCount > 0) {
    didEnsureDefaultCategories = true;
    return;
  }

  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  didEnsureDefaultCategories = true;
};

const toCategoryTree = (
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>,
) => {
  const nodeMap = new Map<string, CategoryTreeNode>();
  for (const category of categories) {
    nodeMap.set(category.id, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];
  for (const category of categories) {
    const node = nodeMap.get(category.id);
    if (!node) {
      continue;
    }

    if (category.parentId) {
      const parentNode = nodeMap.get(category.parentId);
      if (parentNode) {
        parentNode.children?.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  return roots;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const take = parseTake(url.searchParams.get("take"));

    await ensureDefaultCategories();

    const [banners, categories, collectionLinks, collectionCategoryProducts, newProducts, bestProducts, saleProducts, settings] =
      await Promise.all([
        prisma.banner.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
          select: {
            id: true,
            kind: true,
            title: true,
            subtitle: true,
            imageUrl: true,
            ctaLabel: true,
            ctaHref: true,
          },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
          },
        }),
        getHeaderCollectionLinks(8),
        getProductsByCategorySlug("bo-suu-tap", take),
        getNewProducts(take),
        getBestProducts(take),
        getSaleProducts(take),
        prisma.siteSetting.findMany({
          where: {
            key: {
              in: ["brand", "contact"],
            },
          },
          select: {
            key: true,
            value: true,
          },
        }),
      ]);

    const categoryTree = toCategoryTree(categories);

    const settingMap = new Map(settings.map((setting) => [setting.key, setting.value]));
    const brandSetting = parseJsonSetting(settingMap.get("brand"));
    const contactSetting = parseJsonSetting(settingMap.get("contact"));

    const brandName =
      typeof brandSetting?.name === "string" && brandSetting.name.trim()
        ? brandSetting.name.trim()
        : undefined;
    const brandTagline =
      typeof brandSetting?.tagline === "string" && brandSetting.tagline.trim()
        ? brandSetting.tagline.trim()
        : undefined;
    const rawPhone =
      typeof contactSetting?.phone === "string" && contactSetting.phone.trim()
        ? contactSetting.phone.trim()
        : undefined;
    const rawHotline =
      typeof contactSetting?.hotline === "string" && contactSetting.hotline.trim()
        ? contactSetting.hotline.trim()
        : undefined;

    const phone = normalizeSitePhone(rawPhone ?? rawHotline);
    const hotline = normalizeSitePhone(rawHotline ?? rawPhone);
    const heroBannerRows = banners.filter((banner) => banner.kind === BannerKind.HERO);
    const popupBannerRow = banners.find((banner) => banner.kind === BannerKind.POPUP) ?? null;

    return NextResponse.json(
      {
        collectionLinks,
        categoryTree,
        heroBanners: heroBannerRows.map((banner) => ({
          src: banner.imageUrl,
          alt: banner.subtitle?.trim() || banner.title,
        })),
        popupBanner: popupBannerRow
          ? {
              src: popupBannerRow.imageUrl,
              alt: popupBannerRow.subtitle?.trim() || popupBannerRow.title,
              title: popupBannerRow.title,
              subtitle: popupBannerRow.subtitle,
              ctaLabel: popupBannerRow.ctaLabel,
              ctaHref: popupBannerRow.ctaHref,
            }
          : null,
        products: {
          new: newProducts,
          best: bestProducts,
          sale: saleProducts,
          collection: collectionCategoryProducts?.products ?? [],
        },
        site: {
          brand: {
            name: brandName,
            tagline: brandTagline,
          },
          contact: {
            phone,
            hotline,
          },
        },
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while loading home data";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
