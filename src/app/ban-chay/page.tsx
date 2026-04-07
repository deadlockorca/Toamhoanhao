import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getBestProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function BestSellerPage() {
  const products = await getBestProducts(48);

  return (
    <PublicProductGridPage
      title="Sản phẩm bán chạy"
      breadcrumbLabel="Bán chạy nhất"
      badgeLabel="Best seller"
      subtitle="Các mẫu được khách hàng quan tâm và mua nhiều, ưu tiên hiển thị theo dữ liệu bán hàng."
      products={products}
      emptyMessage="Hiện chưa có dữ liệu sản phẩm bán chạy."
    />
  );
}
