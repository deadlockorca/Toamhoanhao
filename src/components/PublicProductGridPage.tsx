import Link from "next/link";

import PublicProductGrid from "@/components/PublicProductGrid";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createBreadcrumbJsonLd } from "@/lib/seo";
import { getPublicSidebarCategoryLinks, type PublicProductCard } from "@/lib/public-catalog";

type PublicProductGridPageProps = {
  title: string;
  breadcrumbLabel: string;
  subtitle?: string;
  badgeLabel?: string;
  activeMenuKey?: string;
  products: PublicProductCard[];
  emptyMessage?: string;
  mobilePageSize?: number;
  desktopPageSize?: number;
  pagePath: string;
  breadcrumbParent?: {
    name: string;
    path: string;
  };
  topBanner?: {
    src: string;
    alt?: string;
  } | null;
};

export default async function PublicProductGridPage({
  title,
  breadcrumbLabel,
  subtitle,
  badgeLabel,
  activeMenuKey,
  products,
  emptyMessage = "Chưa có sản phẩm để hiển thị.",
  mobilePageSize,
  desktopPageSize,
  pagePath,
  breadcrumbParent,
  topBanner,
}: PublicProductGridPageProps) {
  const sidebarCategories = await getPublicSidebarCategoryLinks();
  const breadcrumbItems = [
    { name: "Trang chủ", path: "/" },
    ...(breadcrumbParent ? [breadcrumbParent] : []),
    { name: breadcrumbLabel, path: pagePath },
  ];
  const breadcrumbJsonLd = createBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
          <nav className="mb-8 flex items-center gap-2.5 text-[14px] text-[#737b88] md:text-[15px]">
            <Link href="/" className="transition hover:text-[#4f5968]">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-[#c4a235]">{breadcrumbLabel}</span>
          </nav>

          <PublicProductGrid
            title={title}
            subtitle={subtitle}
            badgeLabel={badgeLabel}
            activeMenuKey={activeMenuKey}
            topBanner={topBanner}
            sidebarCategories={sidebarCategories}
            products={products}
            emptyMessage={emptyMessage}
            mobilePageSize={mobilePageSize}
            desktopPageSize={desktopPageSize}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
