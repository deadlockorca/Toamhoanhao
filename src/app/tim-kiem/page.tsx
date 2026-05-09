import PublicProductGridPage from "@/components/PublicProductGridPage";
import {
  countPublicSearchProducts,
  getActiveCategoryBanner,
  searchPublicProducts,
} from "@/lib/public-catalog";

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
  const maxFetchedProducts = 160;

  const [products, totalMatchedProducts, categoryBanner] = await Promise.all([
    query ? searchPublicProducts(query, maxFetchedProducts) : Promise.resolve([]),
    query ? countPublicSearchProducts(query) : Promise.resolve(0),
    getActiveCategoryBanner(),
  ]);

  const subtitle = query
    ? totalMatchedProducts > products.length
      ? `Kết quả cho "${query}" (hiển thị ${products.length}/${totalMatchedProducts} sản phẩm).`
      : `Kết quả cho "${query}" (${totalMatchedProducts} sản phẩm).`
    : "Nhập từ khóa vào ô tìm kiếm để bắt đầu.";

  return (
    <PublicProductGridPage
      title="Tìm kiếm sản phẩm"
      breadcrumbLabel="Tìm kiếm"
      pagePath={query ? `/tim-kiem?q=${encodeURIComponent(query)}` : "/tim-kiem"}
      badgeLabel="Search"
      subtitle={subtitle}
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
