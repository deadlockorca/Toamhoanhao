import { ProductStatus } from "@prisma/client";
import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { toAbsoluteUrl } from "@/lib/seo";

const staticRoutes: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/gioi-thieu", changeFrequency: "monthly", priority: 0.7 },
  { path: "/lien-he", changeFrequency: "monthly", priority: 0.7 },
  { path: "/he-thong-cua-hang", changeFrequency: "weekly", priority: 0.8 },
  { path: "/bo-suu-tap", changeFrequency: "daily", priority: 0.8 },
  { path: "/giam-gia", changeFrequency: "daily", priority: 0.9 },
  { path: "/san-pham-moi", changeFrequency: "daily", priority: 0.9 },
  { path: "/ban-chay", changeFrequency: "daily", priority: 0.9 },
  { path: "/tim-kiem", changeFrequency: "daily", priority: 0.6 },
  { path: "/ho-tro-khach-hang", changeFrequency: "monthly", priority: 0.5 },
  { path: "/chinh-sach-bao-mat", changeFrequency: "yearly", priority: 0.4 },
  { path: "/chinh-sach-va-quy-dinh", changeFrequency: "yearly", priority: 0.4 },
  { path: "/huong-dan-doi-tra", changeFrequency: "yearly", priority: 0.5 },
  { path: "/huong-dan-giao-hang-lap-dat", changeFrequency: "yearly", priority: 0.5 },
  { path: "/huong-dan-luu-kho", changeFrequency: "yearly", priority: 0.4 },
  { path: "/huong-dan-su-dung", changeFrequency: "yearly", priority: 0.4 },
  { path: "/dat-hang-online", changeFrequency: "yearly", priority: 0.5 },
  { path: "/tra-cuu-don-hang", changeFrequency: "yearly", priority: 0.3 },
  { path: "/tuyen-dung", changeFrequency: "monthly", priority: 0.3 },
];

const staticEntries = (): MetadataRoute.Sitemap =>
  staticRoutes.map((item) => ({
    url: toAbsoluteUrl(item.path),
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticItems = staticEntries();

  try {
    const [products, categories, collections] = await Promise.all([
      prisma.product.findMany({
        where: {
          isPublished: true,
          status: ProductStatus.ACTIVE,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      prisma.collection.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ]);

    const productItems: MetadataRoute.Sitemap = products.map((item) => ({
      url: toAbsoluteUrl(`/san-pham/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryItems: MetadataRoute.Sitemap = categories.map((item) => ({
      url: toAbsoluteUrl(`/danh-muc/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const collectionItems: MetadataRoute.Sitemap = collections.map((item) => ({
      url: toAbsoluteUrl(`/bo-suu-tap/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticItems, ...productItems, ...categoryItems, ...collectionItems];
  } catch {
    return staticItems;
  }
}
