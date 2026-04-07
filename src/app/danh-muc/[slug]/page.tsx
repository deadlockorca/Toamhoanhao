import { notFound, redirect } from "next/navigation";

import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getProductsByCategorySlug } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "ghe-ghe") {
    redirect("/danh-muc/ghe");
  }

  const data = await getProductsByCategorySlug(slug, 120);

  if (!data) {
    notFound();
  }

  return (
    <PublicProductGridPage
      title={data.category.name}
      breadcrumbLabel={data.category.name}
      badgeLabel="Danh mục sản phẩm"
      subtitle={
        data.category.description ??
        "Danh sách sản phẩm theo danh mục đã chọn, bao gồm cả các nhóm con."
      }
      products={data.products}
      emptyMessage="Danh mục này hiện chưa có sản phẩm hiển thị."
    />
  );
}
