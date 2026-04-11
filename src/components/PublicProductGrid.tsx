"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { type PublicProductCard } from "@/lib/public-catalog";

type PublicProductGridProps = {
  products: PublicProductCard[];
  emptyMessage: string;
  mobilePageSize?: number;
  desktopPageSize?: number;
};

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 639px)";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

export default function PublicProductGrid({
  products,
  emptyMessage,
  mobilePageSize,
  desktopPageSize,
}: PublicProductGridProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);

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

  const activePageSize = isMobileViewport ? mobilePageSize : desktopPageSize;
  const isPagingEnabled = Boolean(activePageSize);
  const totalPages = isPagingEnabled ? Math.ceil(products.length / (activePageSize as number)) : 1;
  const effectivePage = isPagingEnabled ? Math.min(mobilePage, totalPages > 0 ? totalPages : 1) : 1;

  const visibleProducts = useMemo(() => {
    if (!isPagingEnabled) {
      return products;
    }

    const pageSize = activePageSize as number;
    const start = (effectivePage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [activePageSize, effectivePage, isPagingEnabled, products]);

  if (products.length === 0) {
    return (
      <div className="mt-7 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
        {emptyMessage}
      </div>
    );
  }

  const gridClass = mobilePageSize
    ? "mt-7 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    : "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

  const goToMobilePage = (nextPage: number) => {
    if (nextPage === effectivePage) {
      return;
    }
    setMobilePage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
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
            onClick={() => goToMobilePage(Math.max(1, effectivePage - 1))}
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
            onClick={() => goToMobilePage(Math.min(totalPages, effectivePage + 1))}
            disabled={effectivePage >= totalPages}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6dae2] bg-white px-4 text-[13px] font-semibold text-[#2f3745] transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            Trang tiếp theo
          </button>
        </div>
      ) : null}
    </>
  );
}
