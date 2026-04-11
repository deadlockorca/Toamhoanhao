import { BannerKind, PrismaClient, ProductTab } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  tab: ProductTab;
  categorySlug: string;
};

const resolveR2PublicBaseUrl = () => {
  const cleaned = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (!cleaned) {
    throw new Error("Thiếu R2_PUBLIC_BASE_URL. Không thể seed banner bằng URL R2.");
  }
  return cleaned;
};

const r2PublicBaseUrl = resolveR2PublicBaseUrl();

const toR2BannerUrl = (fileName: string) => `${r2PublicBaseUrl}/banners/${fileName}`;

const categories: SeedCategory[] = [
  {
    name: "Sofa - Ghế thư giãn",
    slug: "sofa-ghe-thu-gian",
    description: "Sofa phòng khách, sofa thư giãn và sofa bed cao cấp.",
    sortOrder: 1,
  },
  {
    name: "Bàn",
    slug: "ban",
    description: "Bàn ăn, bàn cafe, bàn làm việc cho nhiều không gian.",
    sortOrder: 2,
  },
  {
    name: "Ghế",
    slug: "ghe",
    description: "Ghế bar, ghế thư giãn, ghế làm việc và ghế ngoài trời.",
    sortOrder: 3,
  },
  {
    name: "Tủ - Kệ",
    slug: "tu-ke",
    description: "Tủ trang trí, tủ TV, sideboard và nhiều hệ kệ lưu trữ.",
    sortOrder: 4,
  },
  {
    name: "Đồ trang trí",
    slug: "do-trang-tri",
    description: "Đèn, gương, tranh và phụ kiện trang trí nội thất.",
    sortOrder: 5,
  },
];

const products: SeedProduct[] = [
  {
    name: "Ghế Sofa 2 Chỗ Graystone",
    slug: "new-ghe-sofa-2-cho-graystone",
    imageUrl: "/products/p1.jpg",
    price: 13900000,
    originalPrice: 15900000,
    badge: "Mới",
    tab: ProductTab.NEW,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Ghế Sofa Đơn Module Drift",
    slug: "new-ghe-sofa-don-module-drift",
    imageUrl: "/products/p2.jpg",
    price: 8990000,
    badge: "Mới",
    tab: ProductTab.NEW,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Tủ Hộc Trishley Gỗ Sồi",
    slug: "new-tu-hoc-trishley-go-soi",
    imageUrl: "/products/p3.jpg",
    price: 6590000,
    originalPrice: 7490000,
    tab: ProductTab.NEW,
    categorySlug: "tu-ke",
  },
  {
    name: "Gương Trang Trí Monticello",
    slug: "new-guong-trang-tri-monticello",
    imageUrl: "/products/p4.jpg",
    price: 4290000,
    tab: ProductTab.NEW,
    categorySlug: "do-trang-tri",
  },
  {
    name: "Sofa 3 Chỗ Eric Church Màu Xám",
    slug: "new-sofa-3-cho-eric-church-xam",
    imageUrl: "/products/p5.jpg",
    price: 22900000,
    originalPrice: 25900000,
    tab: ProductTab.NEW,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Sofa Bed Noah Màu Kem",
    slug: "new-sofa-bed-noah-mau-kem",
    imageUrl: "/products/p6.jpg",
    price: 11900000,
    badge: "Hot",
    tab: ProductTab.NEW,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Bàn Cafe Tyler",
    slug: "new-ban-cafe-tyler",
    imageUrl: "/products/p7.jpg",
    price: 5490000,
    tab: ProductTab.NEW,
    categorySlug: "ban",
  },
  {
    name: "Ghế Bar Tyler",
    slug: "new-ghe-bar-tyler",
    imageUrl: "/products/p8.jpg",
    price: 3290000,
    tab: ProductTab.NEW,
    categorySlug: "ghe",
  },
  {
    name: "Sofa Bed Manhattan",
    slug: "best-sofa-bed-manhattan",
    imageUrl: "/products/p9.jpg",
    price: 12490000,
    originalPrice: 14100000,
    badge: "Bán chạy",
    tab: ProductTab.BEST,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Sofa Bed Góc Compact Màu Xám",
    slug: "best-sofa-bed-goc-compact-xam",
    imageUrl: "/products/p10.jpg",
    price: 14990000,
    originalPrice: 16900000,
    badge: "Bán chạy",
    tab: ProductTab.BEST,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Sofa Bed Góc Compact Màu Be",
    slug: "best-sofa-bed-goc-compact-be",
    imageUrl: "/products/p11.jpg",
    price: 14990000,
    originalPrice: 16900000,
    tab: ProductTab.BEST,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Ghế Sofa 3 Chỗ Vermont",
    slug: "best-ghe-sofa-3-cho-vermont",
    imageUrl: "/products/p12.jpg",
    price: 17900000,
    tab: ProductTab.BEST,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Ghế Sofa 2 Chỗ Graystone (Bán chạy)",
    slug: "best-ghe-sofa-2-cho-graystone",
    imageUrl: "/products/p1.jpg",
    price: 13900000,
    tab: ProductTab.BEST,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Gương Trang Trí Monticello (Bán chạy)",
    slug: "best-guong-trang-tri-monticello",
    imageUrl: "/products/p4.jpg",
    price: 4290000,
    tab: ProductTab.BEST,
    categorySlug: "do-trang-tri",
  },
  {
    name: "Bàn Cafe Tyler (Bán chạy)",
    slug: "best-ban-cafe-tyler",
    imageUrl: "/products/p7.jpg",
    price: 5490000,
    tab: ProductTab.BEST,
    categorySlug: "ban",
  },
  {
    name: "Ghế Bar Tyler (Bán chạy)",
    slug: "best-ghe-bar-tyler",
    imageUrl: "/products/p8.jpg",
    price: 3290000,
    tab: ProductTab.BEST,
    categorySlug: "ghe",
  },
  {
    name: "Sofa Bed Manhattan (Giảm giá)",
    slug: "sale-sofa-bed-manhattan",
    imageUrl: "/products/p9.jpg",
    price: 10900000,
    originalPrice: 14100000,
    badge: "-23%",
    tab: ProductTab.SALE,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Sofa 3 Chỗ Eric Church Màu Xám (Giảm giá)",
    slug: "sale-sofa-3-cho-eric-church-xam",
    imageUrl: "/products/p5.jpg",
    price: 19900000,
    originalPrice: 25900000,
    badge: "-23%",
    tab: ProductTab.SALE,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Tủ Hộc Trishley Gỗ Sồi (Giảm giá)",
    slug: "sale-tu-hoc-trishley-go-soi",
    imageUrl: "/products/p3.jpg",
    price: 5990000,
    originalPrice: 7490000,
    badge: "-20%",
    tab: ProductTab.SALE,
    categorySlug: "tu-ke",
  },
  {
    name: "Sofa Bed Noah Màu Kem (Giảm giá)",
    slug: "sale-sofa-bed-noah-mau-kem",
    imageUrl: "/products/p6.jpg",
    price: 9990000,
    originalPrice: 11900000,
    badge: "-16%",
    tab: ProductTab.SALE,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Ghế Sofa Đơn Module Drift (Giảm giá)",
    slug: "sale-ghe-sofa-don-module-drift",
    imageUrl: "/products/p2.jpg",
    price: 7990000,
    originalPrice: 8990000,
    tab: ProductTab.SALE,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Ghế Sofa 2 Chỗ Graystone (Giảm giá)",
    slug: "sale-ghe-sofa-2-cho-graystone",
    imageUrl: "/products/p1.jpg",
    price: 12490000,
    originalPrice: 15900000,
    tab: ProductTab.SALE,
    categorySlug: "sofa-ghe-thu-gian",
  },
  {
    name: "Bàn Cafe Tyler (Giảm giá)",
    slug: "sale-ban-cafe-tyler",
    imageUrl: "/products/p7.jpg",
    price: 4990000,
    originalPrice: 5490000,
    tab: ProductTab.SALE,
    categorySlug: "ban",
  },
  {
    name: "Ghế Bar Tyler (Giảm giá)",
    slug: "sale-ghe-bar-tyler",
    imageUrl: "/products/p8.jpg",
    price: 2790000,
    originalPrice: 3290000,
    tab: ProductTab.SALE,
    categorySlug: "ghe",
  },
];

const banners = [
  {
    slug: "banner-phong-khach",
    kind: BannerKind.HERO,
    title: "Banner phòng khách cao cấp",
    subtitle: "Nâng tầm không gian sống cùng nội thất xuất Âu.",
    imageUrl: toR2BannerUrl("slider-1.jpg"),
    sortOrder: 1,
  },
  {
    slug: "banner-phong-ngu",
    kind: BannerKind.HERO,
    title: "Banner nội thất phòng ngủ",
    subtitle: "Thiết kế hiện đại, chất liệu cao cấp.",
    imageUrl: toR2BannerUrl("slider-2.jpg"),
    sortOrder: 2,
  },
  {
    slug: "banner-lavabo",
    kind: BannerKind.HERO,
    title: "Bộ sưu tập Lavabo mới về",
    subtitle: "Tổ Ấm Hoàn Hảo tuyển chọn mẫu đẹp mỗi tuần.",
    imageUrl: toR2BannerUrl("hero-banner.jpg"),
    sortOrder: 3,
  },
  {
    slug: "banner-bo-suu-tap",
    kind: BannerKind.HERO,
    title: "Banner bộ sưu tập nội thất",
    subtitle: "Ưu đãi nổi bật theo từng không gian.",
    imageUrl: toR2BannerUrl("slider-5.jpg"),
    sortOrder: 4,
  },
  {
    slug: "banner-danh-muc",
    kind: BannerKind.CATEGORY,
    title: "Banner chung trang danh mục",
    subtitle: "Nội thất xuất Âu cho mọi không gian sống.",
    imageUrl: toR2BannerUrl("hero-banner.jpg"),
    sortOrder: 1,
  },
];

const pages = [
  {
    title: "Giới Thiệu",
    slug: "gioi-thieu",
    content: "Trang giới thiệu doanh nghiệp đang được cập nhật.",
    isPublished: true,
  },
  {
    title: "Liên Hệ",
    slug: "lien-he",
    content: "Trang liên hệ doanh nghiệp đang được cập nhật.",
    isPublished: true,
  },
];

async function main() {
  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
      },
    });

    categoryIdBySlug.set(category.slug, savedCategory.id);
  }

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found for slug: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        originalPrice: product.originalPrice,
        badge: product.badge,
        tab: product.tab,
        categoryId,
        inStock: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        price: product.price,
        originalPrice: product.originalPrice,
        badge: product.badge,
        tab: product.tab,
        categoryId,
      },
    });
  }

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { slug: banner.slug },
      update: {
        kind: banner.kind,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        sortOrder: banner.sortOrder,
        isActive: true,
      },
      create: {
        slug: banner.slug,
        kind: banner.kind,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        sortOrder: banner.sortOrder,
        isActive: true,
      },
    });
  }

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        isPublished: page.isPublished,
        publishedAt: page.isPublished ? new Date() : null,
      },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
        publishedAt: page.isPublished ? new Date() : null,
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    update: {
      value: JSON.stringify({
        name: "Tổ Ấm Hoàn Hảo",
        tagline: "Nội thất xuất khẩu",
      }),
    },
    create: {
      key: "brand",
      value: JSON.stringify({
        name: "Tổ Ấm Hoàn Hảo",
        tagline: "Nội thất xuất khẩu",
      }),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "contact" },
    update: {
      value: JSON.stringify({
        phone: "0901.827.555",
        hotline: "0901.827.555",
      }),
    },
    create: {
      key: "contact",
      value: JSON.stringify({
        phone: "0901.827.555",
        hotline: "0901.827.555",
      }),
    },
  });

  const [categoryCount, productCount, bannerCount, pageCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.banner.count(),
    prisma.page.count(),
  ]);

  console.log(
    `Seed completed: ${categoryCount} categories, ${productCount} products, ${bannerCount} banners, ${pageCount} pages.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
