"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type PublicProductCard, type PublicSidebarCategoryLink } from "@/lib/public-catalog";

type PublicProductGridProps = {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  activeMenuKey?: string;
  topBanner?: {
    src: string;
    alt?: string;
  } | null;
  sidebarCategories?: PublicSidebarCategoryLink[];
  products: PublicProductCard[];
  emptyMessage: string;
  mobilePageSize?: number;
  desktopPageSize?: number;
};

type SortKey = "name-asc" | "name-desc" | "newest" | "price-asc" | "price-desc";

type PriceRange = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 639px)";

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "name-asc", label: "Tên A-Z" },
  { key: "name-desc", label: "Tên Z-A" },
  { key: "newest", label: "Hàng mới" },
  { key: "price-asc", label: "Giá thấp đến cao" },
  { key: "price-desc", label: "Giá cao xuống thấp" },
];

const PRICE_FILTERS: PriceRange[] = [
  { id: "under-1m", label: "Giá dưới 1.000.000đ", min: 0, max: 1_000_000 },
  { id: "1m-2m", label: "1.000.000đ - 2.000.000đ", min: 1_000_000, max: 2_000_000 },
  { id: "2m-3m", label: "2.000.000đ - 3.000.000đ", min: 2_000_000, max: 3_000_000 },
  { id: "3m-5m", label: "3.000.000đ - 5.000.000đ", min: 3_000_000, max: 5_000_000 },
  { id: "5m-10m", label: "5.000.000đ - 10.000.000đ", min: 5_000_000, max: 10_000_000 },
  { id: "over-10m", label: "Giá trên 10.000.000đ", min: 10_000_000, max: null },
];

const SIDEBAR_SHORTCUT_LINKS: Array<{ key: string; label: string; href: string }> = [
  { key: "sale", label: "Giảm giá", href: "/giam-gia" },
  { key: "new", label: "Sản phẩm mới", href: "/san-pham-moi" },
  { key: "best", label: "Bán chạy nhất", href: "/ban-chay" },
  { key: "collections", label: "Bộ sưu tập", href: "/bo-suu-tap" },
  { key: "contact", label: "Liên hệ", href: "/lien-he" },
];

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatVnd = (value: number) => VND_FORMATTER.format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

const getDiscountPercent = (price: number, originalPrice: number | null) => {
  if (!originalPrice || originalPrice <= 0 || price <= 0 || originalPrice <= price) {
    return null;
  }

  const percent = Math.round(((originalPrice - price) / originalPrice) * 100);
  return percent > 0 ? percent : null;
};

const getComparablePrice = (product: PublicProductCard): number | null => {
  if (product.price > 0) {
    return product.price;
  }

  if (product.originalPrice && product.originalPrice > 0) {
    return product.originalPrice;
  }

  return null;
};

const inRange = (value: number, range: PriceRange) => {
  if (range.max === null) {
    return value >= range.min;
  }

  return value >= range.min && value < range.max;
};

function SidebarArrow({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 text-[#667085] transition-transform ${open ? "rotate-180" : ""}`}>
      <path
        d="m6.5 9.5 5.5 5 5.5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FloatingFilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 6h16M7 12h10M10 18h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PanelCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6 6 18 18M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PublicProductGrid({
  title,
  subtitle,
  badgeLabel,
  activeMenuKey,
  topBanner,
  sidebarCategories = [],
  products,
  emptyMessage,
  mobilePageSize,
  desktopPageSize,
}: PublicProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (!mobilePageSize) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsMobileFilterOpen(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, [mobilePageSize]);

  const filteredAndSortedProducts = useMemo(() => {
    const priceRanges = selectedPriceRanges
      .map((rangeId) => PRICE_FILTERS.find((range) => range.id === rangeId))
      .filter((range): range is PriceRange => Boolean(range));

    const mapped = products.map((product, index) => ({
      product,
      index,
      comparablePrice: getComparablePrice(product),
    }));

    const filtered = mapped.filter((item) => {
      if (priceRanges.length === 0) {
        return true;
      }

      if (item.comparablePrice === null) {
        return false;
      }

      return priceRanges.some((range) => inRange(item.comparablePrice as number, range));
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name-asc":
          return a.product.name.localeCompare(b.product.name, "vi");
        case "name-desc":
          return b.product.name.localeCompare(a.product.name, "vi");
        case "price-asc": {
          const aPrice = a.comparablePrice ?? Number.POSITIVE_INFINITY;
          const bPrice = b.comparablePrice ?? Number.POSITIVE_INFINITY;
          if (aPrice !== bPrice) {
            return aPrice - bPrice;
          }
          return a.index - b.index;
        }
        case "price-desc": {
          const aPrice = a.comparablePrice ?? Number.NEGATIVE_INFINITY;
          const bPrice = b.comparablePrice ?? Number.NEGATIVE_INFINITY;
          if (aPrice !== bPrice) {
            return bPrice - aPrice;
          }
          return a.index - b.index;
        }
        case "newest":
        default:
          return a.index - b.index;
      }
    });

    return sorted.map((item) => item.product);
  }, [products, selectedPriceRanges, sortKey]);

  const activePageSize = isMobileViewport ? mobilePageSize : desktopPageSize;
  const isPagingEnabled = Boolean(activePageSize);
  const totalPages = isPagingEnabled ? Math.ceil(filteredAndSortedProducts.length / (activePageSize as number)) : 1;
  const requestedPage = useMemo(() => {
    const rawPage = searchParams.get("page");
    if (!rawPage) {
      return 1;
    }

    const parsed = Number.parseInt(rawPage, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);
  const effectivePage = isPagingEnabled ? Math.min(requestedPage, totalPages > 0 ? totalPages : 1) : 1;

  const visibleProducts = useMemo(() => {
    if (!isPagingEnabled) {
      return filteredAndSortedProducts;
    }

    const pageSize = activePageSize as number;
    const start = (effectivePage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [activePageSize, effectivePage, filteredAndSortedProducts, isPagingEnabled]);

  const hasPriceFilter = selectedPriceRanges.length > 0;
  const gridClass = mobilePageSize
    ? "mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    : "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

  const setPageQuery = useCallback((page: number, mode: "push" | "replace" = "push") => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    if (mode === "replace") {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!isPagingEnabled) {
      return;
    }

    if (requestedPage !== effectivePage) {
      setPageQuery(effectivePage, "replace");
    }
  }, [effectivePage, isPagingEnabled, requestedPage, setPageQuery]);

  const goToPage = (nextPage: number) => {
    if (nextPage === effectivePage) {
      return;
    }

    setPageQuery(nextPage, "push");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePriceRange = (rangeId: string) => {
    setPageQuery(1, "replace");
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((item) => item !== rangeId) : [...prev, rangeId],
    );
  };

  const applySort = (nextSortKey: SortKey) => {
    if (sortKey === nextSortKey) {
      return;
    }

    setPageQuery(1, "replace");
    setSortKey(nextSortKey);
  };

  const activeSortLabel = SORT_OPTIONS.find((option) => option.key === sortKey)?.label ?? "Hàng mới";
  const hasMobileFilter = sidebarCategories.length > 0 || PRICE_FILTERS.length > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <section className="overflow-hidden rounded-xl border border-[#e3e5ea] bg-white">
          <h2 className="px-4 py-3 text-[15px] font-bold uppercase tracking-[0.05em] text-[#343c49]">Danh mục</h2>
          <div className="border-t border-[#eceff4] px-3 pb-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCategoryListOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-[15px] font-semibold uppercase tracking-[0.02em] text-[#3f4754] transition hover:bg-[#f8f9fb]"
            >
              <span>Danh sách sản phẩm</span>
              <SidebarArrow open={isCategoryListOpen} />
            </button>

            {isCategoryListOpen ? (
              <ul className="mt-2 max-h-[220px] space-y-1 overflow-y-auto pr-1">
                {sidebarCategories.map((category) => {
                  const isActive = activeMenuKey === `category:${category.slug}`;
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/danh-muc/${category.slug}`}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[14px] transition ${
                          isActive ? "bg-[#fbf7e4] font-semibold text-[#be9b22]" : "text-[#495264] hover:bg-[#f8f9fb]"
                        }`}
                      >
                        <span className="text-[14px]">▸</span>
                        <span>{category.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <ul className="mt-2 space-y-1 border-t border-[#eceff4] pt-2">
              {SIDEBAR_SHORTCUT_LINKS.map((item) => {
                const isActive = activeMenuKey === item.key;

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[14px] uppercase transition ${
                        isActive ? "bg-[#fbf7e4] font-semibold text-[#be9b22]" : "text-[#4a5262] hover:bg-[#f8f9fb]"
                      }`}
                    >
                      <span className="text-[14px]">▸</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-xl border border-[#e3e5ea] bg-white">
          <h2 className="px-4 py-3 text-[15px] font-bold uppercase tracking-[0.05em] text-[#343c49]">Giá sản phẩm</h2>
          <div className="max-h-[255px] overflow-y-auto border-t border-[#eceff4] px-3 py-2">
            <ul className="space-y-1.5">
              {PRICE_FILTERS.map((range) => {
                const checked = selectedPriceRanges.includes(range.id);

                return (
                  <li key={range.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[14px] text-[#555f6f] transition hover:bg-[#f8f9fb]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePriceRange(range.id)}
                        className="h-4 w-4 rounded border-[#cdd4df] text-[#b9961f] focus:ring-[#d9be57]"
                      />
                      <span>{range.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
        {badgeLabel ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">{badgeLabel}</p>
        ) : null}

        <h1 className="mt-1 text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">{title}</h1>
        <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
        {subtitle ? <p className="mt-4 max-w-[880px] text-[15px] leading-[1.6] text-[#4f5968]">{subtitle}</p> : null}

        {topBanner?.src ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-[#e3e5ea]">
            <div className="relative aspect-[2000/760] w-full">
              <Image
                src={topBanner.src}
                alt={topBanner.alt?.trim() || title}
                fill
                sizes="(max-width: 1320px) 100vw, 1320px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 border-y border-[#e4e7ee] py-3">
          <div className="sm:hidden">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6a7384]">
                Ưu tiên theo
              </span>
              <select
                value={sortKey}
                onChange={(event) => applySort(event.target.value as SortKey)}
                className="h-11 w-full appearance-auto rounded-lg border border-[#d8dde6] bg-white px-3 text-[14px] font-semibold text-[#2f3745] shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-[#cfb45d] focus:outline-none focus:ring-2 focus:ring-[#f3e5ad]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-1 text-[12px] text-[#7b8493]">Đang chọn: {activeSortLabel}</p>
          </div>

          <div className="hidden items-center gap-2 overflow-x-auto pb-1 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:overflow-visible sm:pb-0">
            <span className="shrink-0 text-[14px] font-semibold text-[#3e4654]">Ưu tiên theo:</span>
            {SORT_OPTIONS.map((option) => {
              const active = sortKey === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => applySort(option.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition ${
                    active
                      ? "border-[#cfb45d] bg-[#fbf7e8] font-semibold text-[#9a7d15]"
                      : "border-[#d8dde6] bg-white text-[#465061] hover:border-[#c4cbd7]"
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border ${
                      active ? "border-[#be9a20] bg-[#be9a20]" : "border-[#adb5c3] bg-white"
                    }`}
                  />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
            {hasPriceFilter ? "Không có sản phẩm phù hợp khoảng giá đã chọn." : emptyMessage}
          </div>
        ) : (
          <>
            <div className={gridClass}>
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/san-pham/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#e7e8ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f3f4f6]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />

                    {product.badge ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#d82b2b] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.03em] text-white">
                        {product.badge}
                      </span>
                    ) : null}
                    {(() => {
                      const discountPercent = getDiscountPercent(product.price, product.originalPrice);
                      if (!discountPercent) {
                        return null;
                      }

                      return (
                        <span className="absolute right-3 top-3 rounded-full bg-[#16a34a] px-2.5 py-1 text-[11px] font-bold text-white">
                          -{discountPercent}%
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2 p-4 text-center">
                    <h2 className="min-h-[2.75rem] text-[15px] font-semibold leading-[1.35] text-[#1f2937]">{product.name}</h2>
                    {isContactPrice(product.price, product.originalPrice) ? (
                      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <span className="text-[17px] font-bold text-[#bf1f15]">Liên Hệ</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <span className="text-[17px] font-bold text-[#bf1f15]">{formatVnd(product.price)}</span>
                        {product.originalPrice ? (
                          <span className="text-[13px] font-medium text-[#8b8f98] line-through">
                            {formatVnd(product.originalPrice)}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {isPagingEnabled && totalPages > 1 ? (
              <div
                className={`mt-5 items-center justify-center gap-3 ${
                  isMobileViewport ? "flex sm:hidden" : "hidden sm:flex"
                }`}
              >
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, effectivePage - 1))}
                  disabled={effectivePage <= 1}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6dae2] bg-white px-4 text-[13px] font-semibold text-[#2f3745] transition disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Trang trước
                </button>
                <span className="text-[13px] font-semibold text-[#4f5968]">
                  Trang {effectivePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, effectivePage + 1))}
                  disabled={effectivePage >= totalPages}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6dae2] bg-white px-4 text-[13px] font-semibold text-[#2f3745] transition disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Trang tiếp theo
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {hasMobileFilter ? (
        <>
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="fixed right-0 top-[58%] z-[96] inline-flex h-12 items-center gap-2 rounded-l-full border border-r-0 border-[#d1d8e3] bg-white px-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#394457] shadow-[0_10px_20px_rgba(15,23,42,0.14)] transition hover:bg-[#fafbfc] sm:hidden"
            aria-label="Mở bộ lọc sản phẩm"
          >
            <FloatingFilterIcon />
            <span>Lọc</span>
          </button>

          <div
            className={`fixed inset-0 z-[120] transition-[visibility] duration-200 sm:hidden ${
              isMobileFilterOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
            }`}
            aria-hidden={!isMobileFilterOpen}
          >
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Đóng bộ lọc"
              className={`absolute inset-0 bg-[rgba(15,23,42,0.44)] transition-opacity duration-200 ${
                isMobileFilterOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            <aside
              className={`absolute right-0 top-0 flex h-full w-[86vw] max-w-[350px] flex-col bg-white shadow-[-20px_0_40px_rgba(15,23,42,0.2)] transition-transform duration-300 ${
                isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#e6eaf1] px-4 py-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">Bộ lọc sản phẩm</p>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dce3ed] bg-white text-[#4a5465]"
                  aria-label="Đóng bộ lọc"
                >
                  <PanelCloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <section className="rounded-lg border border-[#e7ebf2] bg-[#fbfcfe] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">Danh mục</p>
                  <div className="mt-2 max-h-[36vh] overflow-y-auto pr-1">
                    <ul className="space-y-1.5">
                      {sidebarCategories.map((category) => {
                        const isActive = activeMenuKey === `category:${category.slug}`;

                        return (
                          <li key={`mobile-filter-category-${category.slug}`}>
                            <Link
                              href={`/danh-muc/${category.slug}`}
                              onClick={() => setIsMobileFilterOpen(false)}
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition ${
                                isActive
                                  ? "bg-[#fbf7e4] font-semibold text-[#be9b22]"
                                  : "border border-[#e7ebf2] bg-white text-[#495264] hover:bg-[#f8f9fb]"
                              }`}
                            >
                              <span>▸</span>
                              <span>{category.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>

                <section className="mt-3 rounded-lg border border-[#e7ebf2] bg-[#fbfcfe] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">Giá sản phẩm</p>
                  <ul className="mt-2 space-y-1.5">
                    {PRICE_FILTERS.map((range) => {
                      const checked = selectedPriceRanges.includes(range.id);

                      return (
                        <li key={`mobile-filter-price-${range.id}`}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[#e7ebf2] bg-white px-2 py-2 text-[13px] text-[#4d5667]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePriceRange(range.id)}
                              className="h-4 w-4 rounded border-[#cdd4df] text-[#b9961f] focus:ring-[#d9be57]"
                            />
                            <span>{range.label}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  {selectedPriceRanges.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPageQuery(1, "replace");
                        setSelectedPriceRanges([]);
                      }}
                      className="mt-3 w-full rounded-md border border-[#e0c96f] bg-[#fbf4da] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8c6d10]"
                    >
                      Xóa lọc giá
                    </button>
                  ) : null}
                </section>
              </div>

              <div className="border-t border-[#e6eaf1] p-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full rounded-lg bg-[#c9a22f] px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#1f232c] transition hover:brightness-95"
                >
                  Xem sản phẩm
                </button>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
