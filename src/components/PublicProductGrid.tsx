"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

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
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(true);

  useEffect(() => {
    if (!mobilePageSize) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
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
  const effectivePage = isPagingEnabled ? Math.min(currentPage, totalPages > 0 ? totalPages : 1) : 1;

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

  const goToPage = (nextPage: number) => {
    if (nextPage === effectivePage) {
      return;
    }

    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePriceRange = (rangeId: string) => {
    setCurrentPage(1);
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((item) => item !== rangeId) : [...prev, rangeId],
    );
  };

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

        <div className="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-2 border-y border-[#e4e7ee] py-3 sm:flex">
          <span className="text-[14px] font-semibold text-[#3e4654]">Ưu tiên theo:</span>
          {SORT_OPTIONS.map((option) => {
            const active = sortKey === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  if (sortKey === option.key) {
                    return;
                  }
                  setCurrentPage(1);
                  setSortKey(option.key);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition ${
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
    </div>
  );
}
