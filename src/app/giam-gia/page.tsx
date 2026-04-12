import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, getSaleProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function SaleProductsPage() {
  const [products, categoryBanner] = await Promise.all([getSaleProducts(48), getActiveCategoryBanner()]);

  return (
    <PublicProductGridPage
      title="Sản phẩm giảm giá"
      breadcrumbLabel="Giảm giá"
      badgeLabel="Ưu đãi nổi bật"
      activeMenuKey="sale"
      subtitle="Danh sách sản phẩm đang có ưu đãi tốt. Giá hiển thị đã đồng bộ theo dữ liệu quản trị."
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
      emptyMessage="Hiện chưa có sản phẩm giảm giá."
    />
  );
}
