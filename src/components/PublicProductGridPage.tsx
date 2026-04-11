import Image from "next/image";
import Link from "next/link";

import PublicProductGrid from "@/components/PublicProductGrid";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { type PublicProductCard } from "@/lib/public-catalog";

type PublicProductGridPageProps = {
  title: string;
  breadcrumbLabel: string;
  subtitle?: string;
  badgeLabel?: string;
  products: PublicProductCard[];
  emptyMessage?: string;
  mobilePageSize?: number;
  desktopPageSize?: number;
  topBanner?: {
    src: string;
    alt?: string;
  } | null;
};

export default function PublicProductGridPage({
  title,
  breadcrumbLabel,
  subtitle,
  badgeLabel,
  products,
  emptyMessage = "Chưa có sản phẩm để hiển thị.",
  mobilePageSize,
  desktopPageSize,
  topBanner,
}: PublicProductGridPageProps) {
  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
          <nav className="mb-8 flex items-center gap-2.5 text-[14px] text-[#737b88] md:text-[15px]">
            <Link href="/" className="transition hover:text-[#4f5968]">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-[#c4a235]">{breadcrumbLabel}</span>
          </nav>

          {topBanner?.src ? (
            <section className="mb-7 overflow-hidden rounded-2xl border border-[#e3e5ea] bg-white">
              <div className="relative aspect-[2000/760] w-full">
                <Image
                  src={topBanner.src}
                  alt={topBanner.alt?.trim() || title}
                  fill
                  sizes="(max-width: 1320px) 100vw, 1320px"
                  className="object-cover"
                />
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            {badgeLabel ? (
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">{badgeLabel}</p>
            ) : null}
            <h1 className="mt-1 text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">{title}</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            {subtitle ? <p className="mt-5 max-w-[880px] text-[15px] leading-[1.6] text-[#4f5968]">{subtitle}</p> : null}
            <PublicProductGrid
              products={products}
              emptyMessage={emptyMessage}
              mobilePageSize={mobilePageSize}
              desktopPageSize={desktopPageSize}
            />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
