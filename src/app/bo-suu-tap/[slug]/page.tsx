import { notFound } from "next/navigation";

import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getCollectionBySlug, getProductsByCollectionId } from "@/lib/public-catalog";

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

  const products = await getProductsByCollectionId(collection.id, 72);

  return (
    <PublicProductGridPage
      title={collection.name}
      breadcrumbLabel={collection.name}
      badgeLabel="Collection detail"
      subtitle={collection.description ?? "Danh sách sản phẩm thuộc bộ sưu tập này."}
      products={products}
      emptyMessage="Bộ sưu tập này chưa có sản phẩm hiển thị."
    />
  );
}
