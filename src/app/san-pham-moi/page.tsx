import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, getNewProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function NewProductsPage() {
  const [products, categoryBanner] = await Promise.all([getNewProducts(48), getActiveCategoryBanner()]);

  return (
    <PublicProductGridPage
      title="Sản phẩm mới"
      breadcrumbLabel="Sản phẩm mới"
      badgeLabel="New arrivals"
      activeMenuKey="new"
      subtitle="Những sản phẩm vừa được cập nhật mới nhất trên hệ thống."
      topBanner={
        categoryBanner
          ? {
              src: categoryBanner.imageUrl,
              alt: categoryBanner.subtitle?.trim() || categoryBanner.title,
            }
          : null
      }
      products={products}
      mobilePageSize={8}
      desktopPageSize={20}
      emptyMessage="Hiện chưa có sản phẩm mới."
    />
  );
}
