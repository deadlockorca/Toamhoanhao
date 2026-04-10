import Image from "next/image";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getActiveCollections } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export default async function CollectionIndexPage() {
  const collections = await getActiveCollections(48);

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

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">Collections</p>
            <h1 className="mt-1 text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">Bộ sưu tập sản phẩm</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            <p className="mt-5 max-w-[880px] text-[15px] leading-[1.6] text-[#4f5968]">
              Tập hợp các bộ sưu tập được quản trị viên cấu hình để trưng bày sản phẩm theo chủ đề.
            </p>

            {collections.length > 0 ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {collections.map((collection) => {
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
            ) : (
              <div className="mt-7 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
                Hiện chưa có bộ sưu tập nào đang bật.
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
