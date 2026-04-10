"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type MobileCategoryIconKind = "table" | "sofa" | "chair" | "cabinet" | "bed" | "decor" | "home" | "outdoor";

function MobileCategoryIcon({ kind }: { kind: MobileCategoryIconKind }) {
  if (kind === "table") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M3 9h18M5 9v3m14-3v3M7 21V12m10 9V12M4 7h16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "sofa") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M4 12v5h16v-5M6 12V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M4 17v2M20 17v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "chair") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M8 6h8v6H8zM7 12h10v4H7zM8 16v4m8-4v4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "cabinet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M3.5 8h17M3.5 16h17M4 5h16v14H4zM10 8v8m4-8v8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "bed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M4 12h16v5H4zM6 10h4v2H6zM11 10h7v2h-7zM4 17v2m16-2v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "decor") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M6 19h12M8.5 19v-6a3.5 3.5 0 1 1 7 0v6M12 4v3m0 5v.01"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path
          d="M4 10.5 12 4l8 6.5V20H4zM9.5 20v-5h5V20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M4 16c2.2-3 4.5-4.5 8-4.5s5.8 1.5 8 4.5M7 11l-1.2-2.2M17 11l1.2-2.2M12 8V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CategoryNode = {
  id?: string;
  slug?: string;
  name: string;
  children?: CategoryNode[];
};

type BannerItem = {
  src: string;
  alt: string;
};

type PopupBannerItem = {
  src: string;
  alt: string;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

type ProductTabId = "new" | "best" | "sale";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
};

type CollectionShowcaseItem = {
  id: string;
  name: string;
  slug: string;
  description: string | undefined;
  imageUrl: string | undefined;
  itemCount: number;
};

type MobileCategoryShortcut = {
  id: string;
  label: string;
  slug: string;
  kind: MobileCategoryIconKind;
};

const mobileCategoryShortcutPreset: MobileCategoryShortcut[] = [
  { id: "cat-ban", label: "Bàn", slug: "ban", kind: "table" },
  { id: "cat-sofa", label: "Sofa", slug: "sofa-ghe-thu-gian", kind: "sofa" },
  { id: "cat-ghe", label: "Ghế", slug: "ghe", kind: "chair" },
  { id: "cat-tu-ke", label: "Tủ kệ", slug: "tu-ke", kind: "cabinet" },
  { id: "cat-giuong", label: "Giường", slug: "giuong", kind: "bed" },
  { id: "cat-decor", label: "Đồ trang trí", slug: "do-trang-tri", kind: "decor" },
  { id: "cat-home", label: "Đồ gia dụng", slug: "do-gia-dung", kind: "home" },
  { id: "cat-outdoor", label: "Không gian", slug: "khong-gian-ngoai-troi", kind: "outdoor" },
];

const homeProductSections: Array<{
  id: ProductTabId;
  title: string;
  href: string;
  chip: string;
  emptyMessage: string;
}> = [
  {
    id: "sale",
    title: "Giảm giá",
    href: "/giam-gia",
    chip: "Ưu đãi",
    emptyMessage: "Hiện chưa có sản phẩm giảm giá.",
  },
  {
    id: "new",
    title: "Sản phẩm mới",
    href: "/san-pham-moi",
    chip: "New arrivals",
    emptyMessage: "Hiện chưa có sản phẩm mới.",
  },
  {
    id: "best",
    title: "Bán chạy nhất",
    href: "/ban-chay",
    chip: "Best seller",
    emptyMessage: "Hiện chưa có dữ liệu sản phẩm bán chạy.",
  },
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice?: number) =>
  price <= 0 && (originalPrice == null || originalPrice <= 0);

const PROMO_POPUP_STORAGE_KEY = "toamhoanhao:promo-popup-closed-at";
const PROMO_POPUP_COOLDOWN_MS = 12 * 60 * 60 * 1000;

type ProductApiPayload = Partial<Record<ProductTabId, ProductItem[]>>;

type HomeApiPayload = {
  collections?: Array<{
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
    itemCount?: number;
  }>;
  categoryTree?: CategoryNode[];
  heroBanners?: BannerItem[];
  popupBanner?: PopupBannerItem | null;
  products?: ProductApiPayload;
  site?: {
    brand?: {
      name?: string;
      tagline?: string;
    };
    contact?: {
      phone?: string;
      hotline?: string;
    };
  };
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [heroBanners, setHeroBanners] = useState<BannerItem[]>([]);
  const [popupBanner, setPopupBanner] = useState<PopupBannerItem | null>(null);
  const [siteBrandName, setSiteBrandName] = useState("Tổ Ấm Hoàn Hảo");
  const [siteBrandTagline, setSiteBrandTagline] = useState("Nội thất xuất khẩu");
  const [sitePhone, setSitePhone] = useState("0901.827.555");
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false);
  const [isPromoPopupEligible, setIsPromoPopupEligible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const rawValue = window.localStorage.getItem(PROMO_POPUP_STORAGE_KEY);
      if (!rawValue) {
        return true;
      }

      const closedAt = Number(rawValue);
      return !(Number.isFinite(closedAt) && Date.now() - closedAt < PROMO_POPUP_COOLDOWN_MS);
    } catch {
      return true;
    }
  });
  const [databaseProductData, setDatabaseProductData] = useState<Record<ProductTabId, ProductItem[]>>({
    new: [],
    best: [],
    sale: [],
  });
  const [collectionCards, setCollectionCards] = useState<CollectionShowcaseItem[]>([]);
  const productRailRefs = useRef<Record<ProductTabId, HTMLDivElement | null>>({
    new: null,
    best: null,
    sale: null,
  });
  const collectionRailRef = useRef<HTMLDivElement | null>(null);
  const totalSlides = heroBanners.length;
  const promoImage = popupBanner?.src ?? null;
  const promoTitle = popupBanner?.title?.trim() || "SOFA DA BỘ";
  const promoSubtitle = popupBanner?.subtitle?.trim() || "Ưu Đãi Độc Quyền";
  const promoCtaLabel = popupBanner?.ctaLabel?.trim() || "Liên hệ ngay";
  const promoCtaHref = popupBanner?.ctaHref?.trim() || "/lien-he";

  const closePromoPopup = useCallback(() => {
    setIsPromoPopupOpen(false);
    setIsPromoPopupEligible(false);
    try {
      window.localStorage.setItem(PROMO_POPUP_STORAGE_KEY, String(Date.now()));
    } catch {}
  }, []);

  useEffect(() => {
    if (!isPromoPopupEligible || !popupBanner?.src?.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsPromoPopupOpen(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPromoPopupEligible, popupBanner]);

  useEffect(() => {
    if (!isPromoPopupOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePromoPopup();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closePromoPopup, isPromoPopupOpen]);

  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    if (totalSlides === 0) {
      return;
    }
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (totalSlides === 0) {
      return;
    }
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) {
      return;
    }
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const safeCurrentSlide = totalSlides > 0 ? currentSlide % totalSlides : 0;
  const activeBanner = totalSlides > 0 ? heroBanners[safeCurrentSlide] : null;
  const mobileCategoryShortcuts = useMemo(() => {
    const categoriesBySlug = new Set(
      categoryTree
        .map((category) => category.slug?.trim())
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
    );

    return mobileCategoryShortcutPreset
      .filter((item) => categoriesBySlug.has(item.slug))
      .map((item) => ({
        ...item,
        href: `/danh-muc/${item.slug}`,
      }));
  }, [categoryTree]);

  const scrollRail = (container: HTMLDivElement | null, direction: "prev" | "next") => {
    if (!container) {
      return;
    }

    const step = container.clientWidth * 0.9;
    container.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let ignore = false;

    const loadHomeData = async () => {
      try {
        const response = await fetch(`/api/home?take=20&ts=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!ignore) {
            setDatabaseProductData({
              new: [],
              best: [],
              sale: [],
            });
            setCollectionCards([]);
          }
          return;
        }

        const payload = (await response.json()) as HomeApiPayload;
        const nextData: Record<ProductTabId, ProductItem[]> = {
          new: Array.isArray(payload.products?.new) ? payload.products.new : [],
          best: Array.isArray(payload.products?.best) ? payload.products.best : [],
          sale: Array.isArray(payload.products?.sale) ? payload.products.sale : [],
        };

        if (!ignore) {
          const normalizedCollectionCards = Array.isArray(payload.collections)
            ? payload.collections
                .map((item) => {
                  const id = typeof item?.id === "string" ? item.id.trim() : "";
                  const name = typeof item?.name === "string" ? item.name.trim() : "";
                  const slug = typeof item?.slug === "string" ? item.slug.trim() : "";
                  const itemCount = typeof item?.itemCount === "number" ? item.itemCount : 0;
                  if (!id || !name || !slug) {
                    return null;
                  }

                  return {
                    id,
                    name,
                    slug,
                    description:
                      typeof item?.description === "string" && item.description.trim()
                        ? item.description.trim()
                        : undefined,
                    imageUrl:
                      typeof item?.imageUrl === "string" && item.imageUrl.trim()
                        ? item.imageUrl.trim()
                        : undefined,
                    itemCount: itemCount > 0 ? itemCount : 0,
                  } satisfies CollectionShowcaseItem;
                })
                .filter((item): item is CollectionShowcaseItem => item !== null)
            : [];

          setCollectionCards(normalizedCollectionCards);
          setCategoryTree(Array.isArray(payload.categoryTree) ? payload.categoryTree : []);
          setHeroBanners(Array.isArray(payload.heroBanners) ? payload.heroBanners : []);
          setPopupBanner(payload.popupBanner?.src ? payload.popupBanner : null);
          setDatabaseProductData(nextData);

          const brandName = payload.site?.brand?.name?.trim();
          const brandTagline = payload.site?.brand?.tagline?.trim();
          const phone = payload.site?.contact?.phone?.trim() || payload.site?.contact?.hotline?.trim();

          if (brandName) {
            setSiteBrandName(brandName);
          }
          if (brandTagline) {
            setSiteBrandTagline(brandTagline);
          }
          if (phone) {
            setSitePhone(phone);
          }
        }
      } catch {
        if (!ignore) {
          setDatabaseProductData({
            new: [],
            best: [],
            sale: [],
          });
          setCollectionCards([]);
          setCategoryTree([]);
          setHeroBanners([]);
          setPopupBanner(null);
        }
      }
    };

    void loadHomeData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      {isPromoPopupOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
          <button
            type="button"
            aria-label="Đóng popup"
            onClick={closePromoPopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label={popupBanner?.title?.trim() || "Ưu đãi độc quyền"}
            className="relative z-[1] w-full max-w-[860px]"
          >
            <button
              type="button"
              aria-label="Đóng"
              onClick={closePromoPopup}
              className="absolute right-3 top-3 z-[30] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dadada] bg-white/95 text-[24px] leading-none text-[#595959] shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition hover:bg-white"
            >
              ×
            </button>

            <div className="overflow-hidden rounded-[24px] border border-[#e2c850] bg-[#f4d83f] shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
              {promoImage ? (
                <Link
                  href={promoCtaHref}
                  onClick={closePromoPopup}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[16/10] w-full max-h-[80vh] bg-[#f4d83f]">
                    <Image
                      src={promoImage}
                      alt={popupBanner?.alt?.trim() || popupBanner?.title?.trim() || "Ưu đãi nội thất"}
                      fill
                      sizes="(max-width: 768px) 92vw, 860px"
                      className="object-contain object-center"
                    />
                  </div>
                </Link>
              ) : (
                <div className="px-5 py-6 text-[#1a1a1a] md:px-8 md:py-9">
                  <p className="font-serif text-[30px] font-semibold uppercase leading-none tracking-[0.03em] text-[#8b6d00]">
                    {siteBrandName}
                  </p>
                  <p className="mt-2 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#96780e]">
                    {siteBrandTagline}
                  </p>
                  <h2 className="mt-4 text-[36px] font-black uppercase leading-[0.95] text-[#101010] md:text-[50px]">
                    {promoTitle}
                  </h2>
                  <p className="mt-2 text-[22px] font-extrabold leading-[1.08] md:text-[30px]">{promoSubtitle}</p>
                  <Link
                    href={promoCtaHref}
                    onClick={closePromoPopup}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d5d5d5] bg-white px-6 text-[17px] font-bold uppercase tracking-[0.03em] text-[#b63d2f] shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
                  >
                    {promoCtaLabel}
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      <SiteHeader />

      <main className="w-full py-0">
        <section aria-label="Banner nổi bật" className="w-full space-y-3 pb-4">
          <div className="relative w-full overflow-hidden bg-white">
            <div className="relative w-full aspect-[2000/760]">
              {activeBanner ? (
                <Image
                  key={activeBanner.src}
                  src={activeBanner.src}
                  alt={activeBanner.alt}
                  fill
                  priority={currentSlide === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1320px) 100vw, 1320px"
                  className="object-contain transition-opacity duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#f3f4f6] text-[14px] text-[#6b7280]">
                  Chưa có banner trong database.
                </div>
              )}
            </div>

            {totalSlides > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Banner trước"
                  className="absolute left-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition hover:bg-black/55"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Banner kế tiếp"
                  className="absolute right-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition hover:bg-black/55"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {totalSlides > 1 ? (
            <div className="flex items-center justify-center gap-2.5">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.src}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Đi đến banner ${index + 1}`}
                  className={`h-2.5 rounded-full transition ${
                    safeCurrentSlide === index ? "w-7 bg-[#1c1c1c]" : "w-2.5 bg-[#b8bbc2]"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </section>

        {mobileCategoryShortcuts.length > 0 ? (
          <section aria-label="Danh mục nhanh trên di động" className="md:hidden">
            <div className="border-y border-[#d7d9de] bg-[#f1f2f4]">
              <div className="overflow-x-auto">
                <div className="flex min-w-max items-start gap-4 px-4 py-4">
                  {mobileCategoryShortcuts.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex w-[74px] shrink-0 flex-col items-center gap-2 text-center"
                      aria-label={`Mở danh mục ${item.label}`}
                    >
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#c7cbd4] bg-[#f5f6f8] text-[#2b3240] shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                        <MobileCategoryIcon kind={item.kind} />
                      </span>
                      <span className="line-clamp-2 min-h-[2rem] text-[13px] font-medium leading-[1.2] text-[#1f2530]">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-label="Danh mục nổi bật" className="pb-12 pt-5">
          <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">
                Danh mục nổi bật
              </p>
            </div>

            <div className="mt-7 space-y-7">
              {homeProductSections.map((section) => {
                const products = databaseProductData[section.id];

                return (
                  <article key={section.id} className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a7f1a]">
                          {section.chip}
                        </p>
                        <h3 className="mt-1 text-[22px] font-semibold text-[#20242a] md:text-[26px]">
                          {section.title}
                        </h3>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Cuộn trái mục ${section.title}`}
                          onClick={() => scrollRail(productRailRefs.current[section.id], "prev")}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d6dae2] bg-white text-[18px] text-[#303744] transition hover:bg-[#f2f4f7]"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label={`Cuộn phải mục ${section.title}`}
                          onClick={() => scrollRail(productRailRefs.current[section.id], "next")}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d6dae2] bg-white text-[18px] text-[#303744] transition hover:bg-[#f2f4f7]"
                        >
                          ›
                        </button>
                        <Link
                          href={section.href}
                          className="inline-flex rounded-full border border-[#dbdee5] px-4 py-2 text-[13px] font-semibold text-[#2f3745] transition hover:bg-[#f6f7fa]"
                        >
                          Xem tất cả
                        </Link>
                      </div>
                    </div>

                    {products.length > 0 ? (
                      <div
                        ref={(node) => {
                          productRailRefs.current[section.id] = node;
                        }}
                        className="mt-5 overflow-x-auto pb-2"
                      >
                        <div className="flex gap-4">
                          {products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/san-pham/${product.slug}`}
                              className="group w-[calc((100%-1rem)/2)] shrink-0 overflow-hidden bg-transparent transition hover:-translate-y-0.5 sm:w-[48%] md:rounded-2xl md:border md:border-[#e7e8ec] md:bg-white md:shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)] lg:w-[19.2%]"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden bg-white md:aspect-square md:bg-[#f3f4f6]">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 640px) 48vw, (max-width: 1024px) 48vw, 20vw"
                                  className="object-contain p-1 transition duration-300 group-hover:scale-[1.03] md:object-cover md:p-0"
                                />

                                {product.badge ? (
                                  <span className="absolute left-2 top-2 rounded-md bg-[#ff1111] px-2.5 py-0.5 text-[11px] font-semibold text-white md:left-3 md:top-3 md:rounded-full md:px-3 md:py-1 md:text-[11px] md:font-bold md:uppercase md:tracking-[0.03em]">
                                    {product.badge}
                                  </span>
                                ) : null}
                              </div>

                              <div className="space-y-1 p-2.5 pt-3 md:space-y-2 md:p-4">
                                <h4 className="min-h-[3.1rem] text-[12px] font-extrabold uppercase leading-[1.35] tracking-[0.01em] text-[#212738] md:min-h-[2.75rem] md:text-[15px] md:font-semibold md:normal-case md:tracking-normal md:text-[#1f2937]">
                                  {product.name}
                                </h4>
                                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                                  {isContactPrice(product.price, product.originalPrice) ? (
                                    <span className="whitespace-nowrap text-[12px] font-extrabold leading-none tracking-[-0.01em] text-[#2da23e] md:text-[17px] md:font-bold md:text-[#bf1f15]">
                                      Liên Hệ
                                    </span>
                                  ) : (
                                    <>
                                      <span className="whitespace-nowrap text-[12px] font-extrabold leading-none tracking-[-0.01em] text-[#2da23e] md:text-[17px] md:font-bold md:text-[#bf1f15]">
                                        {formatVnd(product.price)}
                                      </span>
                                      {product.originalPrice ? (
                                        <span className="whitespace-nowrap text-[9px] font-bold leading-none tracking-[-0.01em] text-[#d41818] line-through md:text-[13px] md:font-medium md:text-[#8b8f98]">
                                          {formatVnd(product.originalPrice)}
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
                        {section.emptyMessage}
                      </div>
                    )}
                  </article>
                );
              })}

              <article className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a7f1a]">
                      Collections
                    </p>
                    <h3 className="mt-1 text-[22px] font-semibold text-[#20242a] md:text-[26px]">
                      Bộ sưu tập
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Cuộn trái mục bộ sưu tập"
                      onClick={() => scrollRail(collectionRailRef.current, "prev")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d6dae2] bg-white text-[18px] text-[#303744] transition hover:bg-[#f2f4f7]"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Cuộn phải mục bộ sưu tập"
                      onClick={() => scrollRail(collectionRailRef.current, "next")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d6dae2] bg-white text-[18px] text-[#303744] transition hover:bg-[#f2f4f7]"
                    >
                      ›
                    </button>
                    <Link
                      href="/bo-suu-tap"
                      className="inline-flex rounded-full border border-[#dbdee5] px-4 py-2 text-[13px] font-semibold text-[#2f3745] transition hover:bg-[#f6f7fa]"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </div>

                {collectionCards.length > 0 ? (
                  <div ref={collectionRailRef} className="mt-5 overflow-x-auto pb-2">
                    <div className="flex gap-4">
                      {collectionCards.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/bo-suu-tap/${collection.slug}`}
                          className="group w-[calc((100%-1rem)/2)] shrink-0 overflow-hidden rounded-2xl border border-[#e7e8ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)] sm:w-[48%] lg:w-[19.2%]"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#f3f4f6]">
                            <Image
                              src={collection.imageUrl ?? "/products/p1.jpg"}
                              alt={collection.name}
                              fill
                              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 48vw, 20vw"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="space-y-2 p-4">
                            <h4 className="text-[17px] font-semibold leading-[1.3] text-[#1f2937]">{collection.name}</h4>
                            {collection.description ? (
                              <p className="line-clamp-2 text-[13px] leading-[1.5] text-[#566072]">{collection.description}</p>
                            ) : null}
                            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9a7f1a]">
                              {collection.itemCount} sản phẩm
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-[#e1e4ea] bg-[#fbfcfd] p-8 text-center text-[14px] text-[#6b7280]">
                    Hiện chưa có bộ sưu tập nào để hiển thị.
                  </div>
                )}
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter sitePhone={sitePhone} />
    </div>
  );
}
