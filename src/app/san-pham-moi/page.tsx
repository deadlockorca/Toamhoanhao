import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getNewProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function NewProductsPage() {
  const products = await getNewProducts(48);

  return (
    <PublicProductGridPage
      title="Sản phẩm mới"
      breadcrumbLabel="Sản phẩm mới"
      badgeLabel="New arrivals"
      subtitle="Những sản phẩm vừa được cập nhật mới nhất trên hệ thống."
      products={products}
      emptyMessage="Hiện chưa có sản phẩm mới."
    />
  );
}
