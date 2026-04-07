import Image from "next/image";
import Link from "next/link";

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
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

export default function PublicProductGridPage({
  title,
  breadcrumbLabel,
  subtitle,
  badgeLabel,
  products,
  emptyMessage = "Chưa có sản phẩm để hiển thị.",
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

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            {badgeLabel ? (
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">{badgeLabel}</p>
            ) : null}
            <h1 className="mt-1 text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">{title}</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            {subtitle ? <p className="mt-5 max-w-[880px] text-[15px] leading-[1.6] text-[#4f5968]">{subtitle}</p> : null}

            {products.length > 0 ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      />

                      {product.badge ? (
                        <span className="absolute left-3 top-3 rounded-full bg-[#d82b2b] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.03em] text-white">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-2 p-4">
                      <h2 className="min-h-[2.75rem] text-[15px] font-semibold leading-[1.35] text-[#1f2937]">
                        {product.name}
                      </h2>
                      {isContactPrice(product.price, product.originalPrice) ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[17px] font-bold text-[#bf1f15]">Liên Hệ</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
            ) : (
              <div className="mt-7 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
                {emptyMessage}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
