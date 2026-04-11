import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, getBestProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function BestSellerPage() {
  const [products, categoryBanner] = await Promise.all([getBestProducts(48), getActiveCategoryBanner()]);

  return (
    <PublicProductGridPage
      title="Sản phẩm bán chạy"
      breadcrumbLabel="Bán chạy nhất"
      badgeLabel="Best seller"
      subtitle="Các mẫu được khách hàng quan tâm và mua nhiều, ưu tiên hiển thị theo dữ liệu bán hàng."
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
      emptyMessage="Hiện chưa có dữ liệu sản phẩm bán chạy."
    />
  );
}
