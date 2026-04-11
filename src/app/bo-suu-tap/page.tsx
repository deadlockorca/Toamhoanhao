import Image from "next/image";
import Link from "next/link";

import PublicCollectionGrid from "@/components/PublicCollectionGrid";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getActiveCategoryBanner, getActiveCollections } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function CollectionIndexPage() {
  const [collections, categoryBanner] = await Promise.all([getActiveCollections(48), getActiveCategoryBanner()]);

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
            <span className="text-[#c4a235]">Bộ sưu tập</span>
          </nav>

          {categoryBanner ? (
            <section className="mb-7 overflow-hidden rounded-2xl border border-[#e3e5ea] bg-white">
              <div className="relative aspect-[2000/760] w-full">
                <Image
                  src={categoryBanner.imageUrl}
                  alt={categoryBanner.subtitle?.trim() || categoryBanner.title}
                  fill
                  sizes="(max-width: 1320px) 100vw, 1320px"
                  className="object-cover"
                />
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">Collections</p>
            <h1 className="mt-1 text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">Bộ sưu tập sản phẩm</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            <p className="mt-5 max-w-[880px] text-[15px] leading-[1.6] text-[#4f5968]">
              Tập hợp các bộ sưu tập được quản trị viên cấu hình để trưng bày sản phẩm theo chủ đề.
            </p>

            <PublicCollectionGrid
              collections={collections}
              emptyMessage="Hiện chưa có bộ sưu tập nào đang bật."
              mobilePageSize={8}
            />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
