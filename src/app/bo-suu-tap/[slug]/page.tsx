import { notFound } from "next/navigation";

import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, getCollectionBySlug, getProductsByCollectionId } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const [products, categoryBanner] = await Promise.all([
    getProductsByCollectionId(collection.id, 72),
    getActiveCategoryBanner(),
  ]);

  return (
    <PublicProductGridPage
      title={collection.name}
      breadcrumbLabel={collection.name}
      pagePath={`/bo-suu-tap/${slug}`}
      breadcrumbParent={{
        name: "Bộ sưu tập",
        path: "/bo-suu-tap",
      }}
      badgeLabel="Collection detail"
      activeMenuKey="collections"
      subtitle={collection.description ?? "Danh sách sản phẩm thuộc bộ sưu tập này."}
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
      emptyMessage="Bộ sưu tập này chưa có sản phẩm hiển thị."
    />
  );
}
