import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getSaleProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function SaleProductsPage() {
  const products = await getSaleProducts(48);

  return (
    <PublicProductGridPage
      title="Sản phẩm giảm giá"
      breadcrumbLabel="Giảm giá"
      badgeLabel="Ưu đãi nổi bật"
      subtitle="Danh sách sản phẩm đang có ưu đãi tốt. Giá hiển thị đã đồng bộ theo dữ liệu quản trị."
      products={products}
      emptyMessage="Hiện chưa có sản phẩm giảm giá."
    />
  );
}
