import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function ContactPage() {
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
            <span className="text-[#c4a235]">Liên hệ</span>
          </nav>

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <h1 className="text-[30px] font-light tracking-[0.02em] text-[#20242a] md:text-[42px]">Liên hệ</h1>
            <div className="mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
          </section>

          <section className="mt-7 rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-[24px] font-semibold text-[#222c3b] md:text-[30px]">Gửi thắc mắc cho chúng tôi</h2>
                <p className="mt-2 text-[14px] text-[#586173] md:text-[15px]">
                  Điền thông tin bên dưới, đội ngũ tư vấn sẽ phản hồi sớm nhất có thể.
                </p>

                <form className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="h-11 rounded-[6px] border border-[#d8dbe2] bg-[#f8f9fb] px-4 text-[14px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#c6a83e]"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="h-11 rounded-[6px] border border-[#d8dbe2] bg-[#f8f9fb] px-4 text-[14px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#c6a83e]"
                    />
                  </div>

                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    className="h-11 w-full rounded-[6px] border border-[#d8dbe2] bg-[#f8f9fb] px-4 text-[14px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#c6a83e]"
                  />

                  <textarea
                    placeholder="Nội dung cần hỗ trợ"
                    rows={5}
                    className="w-full rounded-[6px] border border-[#d8dbe2] bg-[#f8f9fb] px-4 py-3 text-[14px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#c6a83e]"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#e7d268] px-7 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#1f2329] transition hover:bg-[#dcc44f]"
                  >
                    Gửi cho chúng tôi
                  </button>
                </form>
              </div>

              <aside className="rounded-xl bg-[#f9fafb] p-5">
                <div className="overflow-hidden rounded-lg bg-white">
                  <Image
                    src="/images/support/ho-tro-khach-hang-map-toamhoanhao-v2.jpg"
                    alt="Bản đồ thu nhỏ hỗ trợ khách hàng"
                    width={2000}
                    height={2000}
                    unoptimized
                    className="h-auto w-full object-contain"
                  />
                </div>
              </aside>
            </div>

          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
