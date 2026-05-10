import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, getProductsByCategorySlug } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function CollectionProductsPage() {
  const [categoryData, categoryBanner] = await Promise.all([
    getProductsByCategorySlug("bo-suu-tap", 120),
    getActiveCategoryBanner(),
  ]);

  const title = categoryData?.category.name ?? "Bộ sưu tập";
  const subtitle =
    categoryData?.category.description ??
    "Danh sách sản phẩm thuộc danh mục Bộ sưu tập.";

  return (
    <PublicProductGridPage
      title={title}
      breadcrumbLabel={title}
      pagePath="/bo-suu-tap"
      badgeLabel="Danh mục sản phẩm"
      activeMenuKey="collections"
      subtitle={subtitle}
      topBanner={
        categoryBanner
          ? {
              src: categoryBanner.imageUrl,
              alt: categoryBanner.subtitle?.trim() || categoryBanner.title,
            }
          : null
      }
      products={categoryData?.products ?? []}
      mobilePageSize={8}
      desktopPageSize={20}
      emptyMessage="Danh mục Bộ sưu tập hiện chưa có sản phẩm hiển thị."
    />
  );
}
