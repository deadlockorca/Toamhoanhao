"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { type PublicCollectionCard } from "@/lib/public-catalog";

type PublicCollectionGridProps = {
  collections: PublicCollectionCard[];
  emptyMessage: string;
  mobilePageSize?: number;
};

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 639px)";

export default function PublicCollectionGrid({
  collections,
  emptyMessage,
  mobilePageSize,
}: PublicCollectionGridProps) {
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

  const isMobilePagingEnabled = Boolean(mobilePageSize) && isMobileViewport;
  const totalMobilePages = isMobilePagingEnabled ? Math.ceil(collections.length / (mobilePageSize as number)) : 1;
  const effectiveMobilePage = isMobilePagingEnabled
    ? Math.min(mobilePage, totalMobilePages > 0 ? totalMobilePages : 1)
    : 1;

  const visibleCollections = useMemo(() => {
    if (!isMobilePagingEnabled) {
      return collections;
    }

    const pageSize = mobilePageSize as number;
    const start = (effectiveMobilePage - 1) * pageSize;
    return collections.slice(start, start + pageSize);
  }, [collections, effectiveMobilePage, isMobilePagingEnabled, mobilePageSize]);

  if (collections.length === 0) {
    return (
      <div className="mt-7 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
        {emptyMessage}
      </div>
    );
  }

  const gridClass = mobilePageSize
    ? "mt-7 grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    : "mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

  const goToMobilePage = (nextPage: number) => {
    if (nextPage === effectiveMobilePage) {
      return;
    }
    setMobilePage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className={gridClass}>
        {visibleCollections.map((collection) => {
          const image = collection.imageUrl?.trim() || "/products/p1.jpg";

          return (
            <Link
              key={collection.id}
              href={`/bo-suu-tap/${collection.slug}`}
              className="group overflow-hidden rounded-2xl border border-[#e7e8ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#f3f4f6]">
                <Image
                  src={image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="space-y-2 p-4">
                <h2 className="text-[18px] font-semibold leading-[1.3] text-[#1f2937]">{collection.name}</h2>
                {collection.description ? (
                  <p className="line-clamp-2 text-[14px] leading-[1.5] text-[#566072]">{collection.description}</p>
                ) : null}
                <p className="text-[13px] font-medium text-[#9a7f1a]">{collection.itemCount} sản phẩm</p>
              </div>
            </Link>
          );
        })}
      </div>

      {isMobilePagingEnabled && totalMobilePages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => goToMobilePage(Math.max(1, effectiveMobilePage - 1))}
            disabled={effectiveMobilePage <= 1}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6dae2] bg-white px-4 text-[13px] font-semibold text-[#2f3745] transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            Trang trước
          </button>
          <span className="text-[13px] font-semibold text-[#4f5968]">
            Trang {effectiveMobilePage}/{totalMobilePages}
          </span>
          <button
            type="button"
            onClick={() => goToMobilePage(Math.min(totalMobilePages, effectiveMobilePage + 1))}
            disabled={effectiveMobilePage >= totalMobilePages}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6dae2] bg-white px-4 text-[13px] font-semibold text-[#2f3745] transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            Trang tiếp theo
          </button>
        </div>
      ) : null}
    </>
  );
}
