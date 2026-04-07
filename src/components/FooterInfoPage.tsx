import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { footerInfoPages } from "@/lib/footer-info-pages";

type FooterInfoPageProps = {
  slug: string;
};

export default function FooterInfoPage({ slug }: FooterInfoPageProps) {
  const page = footerInfoPages[slug];
  if (!page) {
    notFound();
  }
  const useTableBorders = slug === "huong-dan-giao-hang-lap-dat" || slug === "huong-dan-doi-tra";

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
            <span className="text-[#c4a235]">{page.title}</span>
          </nav>

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <h1 className="text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">{page.title}</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            <article
              className={`footer-info-content mt-6 ${useTableBorders ? "footer-info-content--table-borders" : ""}`}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
