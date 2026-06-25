import Image from "next/image";
import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createBreadcrumbJsonLd } from "@/lib/seo";

const pagePath = "/danh-muc/plywood-van-ep";
const plywoodBanner = {
  src: "/images/plywood/plywood-banner.webp",
  alt: "Plywood chất lượng tạo nên giá trị",
  width: 2005,
  height: 784,
};

const plywoodTypes = [
  {
    title: "Plywood Bintangor 2 mặt",
    description:
      "Bề mặt đẹp, phẳng mịn, độ bền cao, khả năng chịu lực tốt. Phù hợp cho nội thất, ván khuôn, đóng tàu, trang trí và nhiều ứng dụng khác.",
    href: `${pagePath}#plywood-bintangor-2-mat`,
    image: {
      src: "/images/plywood/type-bintangor.webp",
      alt: "Plywood Bintangor 2 mặt",
      width: 1536,
      height: 1024,
    },
  },
  {
    title: "Plywood Okoume 2 mặt",
    description:
      "Nhẹ, bề mặt mịn, dễ gia công, chống ẩm tốt. Thích hợp cho nội thất, trang trí, vách ngăn, và các ứng dụng phổ thông.",
    href: `${pagePath}#plywood-okoume-2-mat`,
    image: {
      src: "/images/plywood/type-okoume.webp",
      alt: "Plywood Okoume 2 mặt",
      width: 1536,
      height: 1024,
    },
  },
];

const plywoodThicknesses = [
  {
    size: "12 mm",
    application: "Nội thất, ốp tường, vách ngăn, trang trí.",
    image: {
      src: "/images/plywood/thickness-12mm.webp",
      alt: "Ván ép độ dày 12 mm",
      width: 1536,
      height: 1024,
    },
  },
  {
    size: "15 mm",
    application: "Nội thất, sàn nhẹ, vách ngăn, cửa.",
    image: {
      src: "/images/plywood/thickness-15mm.webp",
      alt: "Ván ép độ dày 15 mm",
      width: 1536,
      height: 1024,
    },
  },
  {
    size: "18 mm",
    application: "Ván khuôn, sàn, kệ, kết cấu chịu lực vừa.",
    image: {
      src: "/images/plywood/thickness-18mm.webp",
      alt: "Ván ép độ dày 18 mm",
      width: 1536,
      height: 1024,
    },
  },
  {
    size: "24 mm",
    application: "Ván khuôn, kết cấu, đóng tàu, chịu lực cao.",
    image: {
      src: "/images/plywood/thickness-24mm.webp",
      alt: "Ván ép độ dày 24 mm",
      width: 1536,
      height: 1024,
    },
  },
];

const plywoodApplications = [
  {
    label: "Nội thất",
    image: {
      src: "/images/plywood/application-interior.webp",
      alt: "Ứng dụng plywood trong nội thất",
      width: 1411,
      height: 1114,
    },
  },
  {
    label: "Ván khuôn xây dựng",
    image: {
      src: "/images/plywood/application-formwork.webp",
      alt: "Ứng dụng plywood làm ván khuôn xây dựng",
      width: 1410,
      height: 1115,
    },
  },
  {
    label: "Trang trí",
    image: {
      src: "/images/plywood/application-decoration.webp",
      alt: "Ứng dụng plywood trong trang trí",
      width: 1423,
      height: 1105,
    },
  },
  {
    label: "Đóng gói - vận chuyển",
    image: {
      src: "/images/plywood/application-transport.webp",
      alt: "Ứng dụng plywood trong đóng gói và vận chuyển",
      width: 1395,
      height: 1127,
    },
  },
  {
    label: "Đóng tàu",
    image: {
      src: "/images/plywood/application-shipbuilding.webp",
      alt: "Ứng dụng plywood trong đóng tàu",
      width: 1470,
      height: 1070,
    },
  },
];

export default function PlywoodIntroPage() {
  const breadcrumbItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Plywood / Ván ép", path: pagePath },
  ];
  const breadcrumbJsonLd = createBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />

      <main>
        <section className="border-b border-[#e2e6ee] bg-white">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 md:py-12">
            <nav className="mb-6 flex items-center gap-2.5 text-[14px] text-[#737b88] md:text-[15px]">
              <Link href="/" className="transition hover:text-[#4f5968]">
                Trang chủ
              </Link>
              <span>›</span>
              <span className="text-[#c4a235]">Plywood / Ván ép</span>
            </nav>

            <Image
              src={plywoodBanner.src}
              alt={plywoodBanner.alt}
              width={plywoodBanner.width}
              height={plywoodBanner.height}
              priority
              className="h-auto w-full rounded-xl border border-[#d9dee8] shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
            />
          </div>
        </section>

        <section className="bg-[#fff8ef] py-10 md:py-14">
          <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
            <div className="flex items-center justify-center gap-5">
              <span className="h-px w-16 bg-[#c8843e] md:w-24" />
              <h1 className="text-center text-[26px] font-extrabold uppercase leading-tight tracking-[0.04em] text-[#2a1710] md:text-[34px]">
                Các loại Plywood / Ván ép
              </h1>
              <span className="h-px w-16 bg-[#c8843e] md:w-24" />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {plywoodTypes.map((item) => (
                <article
                  key={item.title}
                  className="grid overflow-hidden rounded-lg border border-[#d9a56f] bg-white shadow-[0_10px_26px_rgba(99,56,24,0.08)] md:grid-cols-[1.12fr_0.88fr]"
                >
                  <div className="flex min-h-[260px] flex-col justify-between p-6 md:p-7">
                    <div>
                      <h2 className="text-[20px] font-extrabold uppercase leading-snug tracking-[0.02em] text-[#5b260f] md:text-[23px]">
                        {item.title}
                      </h2>
                      <p className="mt-5 max-w-[360px] text-[15px] leading-7 text-[#46352b] md:text-[16px]">
                        {item.description}
                      </p>
                    </div>

                    <Link
                      href={item.href}
                      className="mt-8 inline-flex h-11 w-fit items-center gap-3 rounded-full border border-[#c9833f] px-5 text-[14px] font-semibold text-[#70401d] transition hover:bg-[#fff2df]"
                    >
                      Xem chi tiết
                      <span aria-hidden="true" className="text-[24px] leading-none">
                        ›
                      </span>
                    </Link>
                  </div>

                  <div className="relative min-h-[220px] overflow-hidden bg-[#fbefe2] md:min-h-full">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 260px, (min-width: 768px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fff8ef] pb-10 md:pb-14">
          <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
            <div className="rounded-lg border border-[#d9a56f] bg-[#fffaf3] px-4 pb-6 pt-5 shadow-[0_10px_26px_rgba(99,56,24,0.06)] md:px-5 md:pb-8">
              <div className="flex items-center justify-center gap-5">
                <span className="h-px flex-1 bg-[#c8843e]" />
                <h2 className="shrink-0 text-center text-[25px] font-extrabold uppercase leading-tight tracking-[0.06em] text-[#2a1710] md:text-[33px]">
                  Quy cách độ dày
                </h2>
                <span className="h-px flex-1 bg-[#c8843e]" />
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-2 md:gap-0 lg:grid-cols-4">
                {plywoodThicknesses.map((item, index) => (
                  <article
                    key={item.size}
                    className={[
                      "px-0 md:px-6",
                      index > 0 ? "lg:border-l lg:border-[#e0b987]" : "",
                      index % 2 === 1 ? "md:border-l md:border-[#e0b987] lg:border-l" : "",
                      index > 1 ? "md:pt-6 lg:pt-0" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <h3 className="text-center text-[25px] font-extrabold tracking-[0.03em] text-[#5b260f] md:text-[30px]">
                      {item.size}
                    </h3>
                    <div className="relative mt-4 aspect-[2.35/1] overflow-hidden rounded-lg bg-[#fbefe2]">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="(min-width: 1024px) 260px, (min-width: 768px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-4 text-[15px] leading-7 text-[#46352b] md:text-[16px]">
                      <span className="font-semibold">Ứng dụng:</span> {item.application}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fff8ef] pb-10 md:pb-14">
          <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
            <div className="flex items-center justify-center gap-5">
              <span className="h-px flex-1 bg-[#c8843e]" />
              <h2 className="shrink-0 text-center text-[25px] font-extrabold uppercase leading-tight tracking-[0.06em] text-[#2a1710] md:text-[33px]">
                Ứng dụng đa dạng
              </h2>
              <span className="h-px flex-1 bg-[#c8843e]" />
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {plywoodApplications.map((item) => (
                <article key={item.label}>
                  <div className="relative aspect-[1.65/1] overflow-hidden rounded-lg bg-[#fbefe2]">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-center text-[15px] font-extrabold uppercase leading-tight tracking-[0.03em] text-[#2a1710] md:text-[17px]">
                    {item.label}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
