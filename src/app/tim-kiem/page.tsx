import PublicProductGridPage from "@/components/PublicProductGridPage";
import { getActiveCategoryBanner, searchPublicProducts } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const toQueryText = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (typeof value !== "string") {
    return "";
  }

  return value;
};

const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, " ").slice(0, 120);

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(toQueryText(resolvedSearchParams.q));

  const [products, categoryBanner] = await Promise.all([
    query ? searchPublicProducts(query, 160) : Promise.resolve([]),
    getActiveCategoryBanner(),
  ]);

  return (
    <PublicProductGridPage
      title="Tìm kiếm sản phẩm"
      breadcrumbLabel="Tìm kiếm"
      badgeLabel="Search"
      subtitle={
        query
          ? `Kết quả cho "${query}" (${products.length} sản phẩm).`
          : "Nhập từ khóa vào ô tìm kiếm để bắt đầu."
      }
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
      emptyMessage={
        query
          ? `Không tìm thấy sản phẩm phù hợp với từ khóa "${query}".`
          : "Bạn chưa nhập từ khóa tìm kiếm."
      }
    />
  );
}
