"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { toAbsoluteUrl } from "@/lib/seo";

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

type ProductTabId = "new" | "best" | "sale" | "collection";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
};

type MobileCategoryShortcut = {
  id: string;
  label: string;
  slug: string;
  kind: MobileCategoryIconKind;
};

type HomeCategoryLink = {
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

const categoryIconBySlug: Record<string, MobileCategoryIconKind> = mobileCategoryShortcutPreset.reduce(
  (acc, item) => {
    acc[item.slug] = item.kind;
    return acc;
  },
  {} as Record<string, MobileCategoryIconKind>,
);

const resolveCategoryIconKind = (slug: string, name: string): MobileCategoryIconKind => {
  const bySlug = categoryIconBySlug[slug];
  if (bySlug) {
    return bySlug;
  }

  const normalized = `${slug} ${name}`.toLowerCase();
  if (normalized.includes("sofa")) return "sofa";
  if (normalized.includes("ghe")) return "chair";
  if (normalized.includes("tu") || normalized.includes("ke")) return "cabinet";
  if (normalized.includes("giuong")) return "bed";
  if (normalized.includes("trang-tri") || normalized.includes("trang tri")) return "decor";
  if (normalized.includes("gia-dung") || normalized.includes("gia dung")) return "home";
  if (normalized.includes("ngoai-troi") || normalized.includes("ngoai troi")) return "outdoor";
  return "table";
};

const saleCategoryExpandSlugs = ["khong-gian-ngoai-troi", "do-cho-be"] as const;

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
  {
    id: "collection",
    title: "Bộ sưu tập",
    href: "/bo-suu-tap",
    chip: "Danh mục",
    emptyMessage: "Danh mục Bộ sưu tập hiện chưa có sản phẩm hiển thị.",
  },
];

const homeWebSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tổ Ấm Hoàn Hảo",
  url: toAbsoluteUrl("/"),
  potentialAction: {
    "@type": "SearchAction",
    target: `${toAbsoluteUrl("/tim-kiem")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice?: number) =>
  price <= 0 && (originalPrice == null || originalPrice <= 0);

const getDiscountPercent = (price: number, originalPrice?: number) => {
  if (!originalPrice || originalPrice <= 0 || price <= 0 || originalPrice <= price) {
    return null;
  }

  const percent = Math.round(((originalPrice - price) / originalPrice) * 100);
  return percent > 0 ? percent : null;
};

const PROMO_POPUP_STORAGE_KEY = "toamhoanhao:promo-popup-closed-at";
const PROMO_POPUP_COOLDOWN_MS = 12 * 60 * 60 * 1000;

type ProductApiPayload = Partial<Record<ProductTabId, ProductItem[]>>;

type HomeApiPayload = {
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
  const [isSaleCategoryExpanded, setIsSaleCategoryExpanded] = useState(false);
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
    collection: [],
  });
  const productRailRefs = useRef<Record<ProductTabId, HTMLDivElement | null>>({
    new: null,
    best: null,
    sale: null,
    collection: null,
  });
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

  const desktopCategoryLinks = useMemo<HomeCategoryLink[]>(() => {
    return categoryTree
      .map((category, index) => {
        const slug = category.slug?.trim() ?? "";
        const label = category.name?.trim() ?? "";
        if (!slug || !label) {
          return null;
        }

        return {
          id: `desktop-cat-${index}-${slug}`,
          slug,
          label,
          kind: resolveCategoryIconKind(slug, label),
        } satisfies HomeCategoryLink;
      })
      .filter((item): item is HomeCategoryLink => item !== null);
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
              collection: [],
            });
          }
          return;
        }

        const payload = (await response.json()) as HomeApiPayload;
        const nextData: Record<ProductTabId, ProductItem[]> = {
          new: Array.isArray(payload.products?.new) ? payload.products.new : [],
          best: Array.isArray(payload.products?.best) ? payload.products.best : [],
          sale: Array.isArray(payload.products?.sale) ? payload.products.sale : [],
          collection: Array.isArray(payload.products?.collection) ? payload.products.collection : [],
        };

        if (!ignore) {
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
            collection: [],
          });
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeWebSiteJsonLd),
        }}
      />
      {isPromoPopupOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
          <button
            type="button"
            aria-label="Đóng popup"
            onClick={closePromoPopup}
            className="absolute inset-0 bg-black/70 transition-opacity duration-300"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label={popupBanner?.title?.trim() || "Ưu đãi độc quyền"}
            className="relative z-[1] w-full max-w-[600px] max-md:max-w-[90vw]"
          >
            <button
              type="button"
              aria-label="Đóng"
              onClick={closePromoPopup}
              className="absolute right-[10px] top-[10px] z-[30] inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[22px] leading-none text-[#595959] shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-white hover:rotate-90"
            >
              ×
            </button>

            <div className="overflow-hidden rounded-[12px] bg-[#f4d83f] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              {promoImage ? (
                <Link
                  href={promoCtaHref}
                  onClick={closePromoPopup}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/4] w-full bg-[#f4d83f]">
                    <Image
                      src={promoImage}
                      alt={popupBanner?.alt?.trim() || popupBanner?.title?.trim() || "Ưu đãi nội thất"}
                      fill
                      sizes="(max-width: 768px) 90vw, 600px"
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
                const isSaleSection = section.id === "sale";
                const saleHighlights = products.slice(0, 4);
                const saleCategoryPreviewCount = 7;
                const saleCategoryBaseLinks = desktopCategoryLinks.slice(0, saleCategoryPreviewCount);
                const saleCategoryExpandedLinks = desktopCategoryLinks.filter((item) =>
                  saleCategoryExpandSlugs.includes(item.slug as (typeof saleCategoryExpandSlugs)[number]),
                );
                const visibleSaleCategoryLinks = isSaleCategoryExpanded
                  ? [...saleCategoryBaseLinks, ...saleCategoryExpandedLinks.filter((item) => !saleCategoryBaseLinks.some((base) => base.slug === item.slug))]
                  : saleCategoryBaseLinks;
                const canToggleSaleCategories = saleCategoryExpandedLinks.length > 0;

                return (
                  <article
                    key={section.id}
                    className={`rounded-2xl border border-[#e5e6ea] bg-white ${
                      isSaleSection ? "overflow-hidden p-5 md:p-0" : "p-5 md:p-6"
                    }`}
                  >
                    <div className={`flex flex-wrap items-end justify-between gap-3 ${isSaleSection ? "md:hidden" : ""}`}>
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

                    {isSaleSection ? (
                      <div className="hidden md:block">
                        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                          <aside className="overflow-hidden border-r border-[#e2e4e9] bg-white">
                            <div className="flex items-center gap-1.5 bg-[#ead044] px-2.5 py-2">
                              <span className="text-[17px] leading-none">🧹</span>
                              <h3 className="text-[16px] font-semibold uppercase tracking-[0.01em] text-[#1f232a]">
                                Danh mục sản phẩm
                              </h3>
                            </div>

                            {desktopCategoryLinks.length > 0 ? (
                              <ul>
                                {visibleSaleCategoryLinks.map((item) => (
                                  <li key={item.id} className="border-b border-dashed border-[#e1e4ea] last:border-b-0">
                                    <Link
                                      href={`/danh-muc/${item.slug}`}
                                      className="flex items-center justify-between gap-2 px-2.5 py-2.5 text-[#242b36] transition hover:bg-[#f7f8fa]"
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <span className="scale-[0.92] text-[#566072]">
                                          <MobileCategoryIcon kind={item.kind} />
                                        </span>
                                        <span className="text-[13px] font-medium">{item.label}</span>
                                      </span>
                                      <span className="text-[17px] leading-none text-[#3b4351]">›</span>
                                    </Link>
                                  </li>
                                ))}
                                {canToggleSaleCategories ? (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={() => setIsSaleCategoryExpanded((prev) => !prev)}
                                      className="block w-full px-2.5 py-2.5 text-left text-[13px] font-medium text-[#2f3746] transition hover:bg-[#f7f8fa]"
                                    >
                                      {isSaleCategoryExpanded ? "Thu gọn" : "Xem thêm ..."}
                                    </button>
                                  </li>
                                ) : null}
                              </ul>
                            ) : (
                              <div className="px-4 py-6 text-[14px] text-[#6b7280]">Hiện chưa có danh mục để hiển thị.</div>
                            )}
                          </aside>

                          <div className="overflow-hidden bg-white">
                            <header className="relative flex items-center justify-between border-t-[4px] border-[#ead044] px-2 pb-3 pt-0.5">
                              <div className="inline-flex h-[62px] items-center bg-[#ead044] pl-3 pr-8 [clip-path:polygon(0_0,84%_0,100%_50%,84%_100%,0_100%)]">
                                <span className="text-[20px] font-semibold uppercase text-[#1f232a]">Giảm giá</span>
                              </div>
                              <span className="pr-2 text-[20px] font-medium uppercase tracking-[0.02em] text-[#2b3240]">
                                GIẢM GIÁ
                              </span>
                            </header>

                            {saleHighlights.length > 0 ? (
                              <div className="grid grid-cols-4 gap-4 px-2 pb-2">
                                {saleHighlights.map((product) => {
                                  const discountPercent = getDiscountPercent(product.price, product.originalPrice);
                                  return (
                                    <Link
                                      key={product.id}
                                      href={`/san-pham/${product.slug}`}
                                      className="group block rounded-md px-2 pb-2 pt-1 transition hover:bg-[#f8f9fb]"
                                    >
                                      <div className="relative mb-4 aspect-[4/3] overflow-hidden">
                                        {discountPercent ? (
                                          <span className="absolute left-1 top-1 z-10 rounded-md bg-[#ff1212] px-3 py-1 text-[14px] font-bold text-white">
                                            {discountPercent}%
                                          </span>
                                        ) : null}
                                        <Image
                                          src={product.image}
                                          alt={product.name}
                                          fill
                                          sizes="(max-width: 1200px) 25vw, 300px"
                                          className="object-contain transition duration-300 group-hover:scale-[1.03]"
                                        />
                                      </div>

                                      <h4 className="line-clamp-2 text-center text-[14px] font-bold uppercase text-[#384152]">
                                        {product.name}
                                      </h4>

                                      <div className="mt-2 flex items-center justify-center gap-2">
                                        {isContactPrice(product.price, product.originalPrice) ? (
                                          <span className="text-[15px] font-bold text-[#2a9f3e]">Liên hệ</span>
                                        ) : (
                                          <>
                                            <span className="text-[15px] font-bold text-[#2a9f3e]">{formatVnd(product.price)}</span>
                                            {product.originalPrice ? (
                                              <span className="text-[14px] font-bold text-[#ea1b1b] line-through">
                                                {formatVnd(product.originalPrice)}
                                              </span>
                                            ) : null}
                                          </>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="px-4 py-8 text-center text-[14px] text-[#6b7280]">
                                Hiện chưa có sản phẩm giảm giá.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className={isSaleSection ? "md:hidden" : ""}>
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
                                  {(() => {
                                    const discountPercent = getDiscountPercent(product.price, product.originalPrice);
                                    if (!discountPercent) {
                                      return null;
                                    }

                                    return (
                                      <span className="absolute right-2 top-2 rounded-md bg-[#16a34a] px-2 py-0.5 text-[11px] font-bold text-white md:right-3 md:top-3 md:rounded-full md:px-2.5 md:py-1">
                                        -{discountPercent}%
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div className="space-y-1 p-2.5 pt-3 text-center md:space-y-2 md:p-4">
                                  <h4 className="min-h-[3.1rem] text-[12px] font-extrabold uppercase leading-[1.35] tracking-[0.01em] text-[#212738] md:min-h-[2.75rem] md:text-[15px] md:font-semibold md:normal-case md:tracking-normal md:text-[#1f2937]">
                                    {product.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
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
                    </div>
                  </article>
                );
              })}

            </div>
          </div>
        </section>
      </main>

      <section className="border-y border-[#d9dbe1] bg-[#ececef]">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-10 md:px-6 md:py-10">
          <div className="mx-auto max-w-[900px] text-center text-[#374151]">
            <p className="text-[16px] font-medium tracking-[0.01em] md:text-[22px]">HÃY GHÉ THĂM</p>
            <h2 className="mt-2 text-[28px] font-bold uppercase leading-[1.08] tracking-[0.02em] md:text-[34px]">
              CỬA HÀNG TỔ ẤM
            </h2>
            <p className="mt-3 text-[16px] font-semibold md:text-[20px]">Tại Hà Nội và Hồ Chí Minh</p>
            <Link
              href="/he-thong-cua-hang"
              className="group relative mt-5 inline-flex h-11 items-center justify-center overflow-hidden rounded-[14px] border border-[#d2b03d] bg-gradient-to-b from-[#f8e26f] via-[#f0d75a] to-[#e4bd33] px-6 text-[14px] font-extrabold uppercase tracking-[0.06em] text-[#151515] shadow-[0_8px_22px_rgba(179,142,28,0.35),inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(179,142,28,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9901c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ececef] active:translate-y-0 active:shadow-[0_6px_16px_rgba(179,142,28,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] md:mt-6 md:h-[56px] md:min-w-[340px] md:px-8 md:text-[17px]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_15%,rgba(255,255,255,0.35)_45%,rgba(255,255,255,0)_75%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="relative z-10">Tìm ngay Tổ Ấm gần nhất</span>
            </Link>
          </div>
          <div className="mx-auto mt-8 max-w-[900px] border-t border-[#d3d6dd] pt-7 text-center md:mt-10 md:pt-8">
            <p className="text-[15px] text-[#3d4453] md:text-[20px]">HOẶC GỌI CHO CHÚNG TÔI (8h30 - 20h30)</p>
            <a
              href={`tel:${sitePhone.replace(/\D/g, "")}`}
              className="mt-5 inline-flex items-center justify-center gap-3 text-[#0f172a] transition hover:opacity-90 md:mt-6 md:gap-5"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-[#6b7280] md:h-7 md:w-7">
                <path d="M4 13.2a8 8 0 1 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <rect
                  x="2.5"
                  y="12.8"
                  width="4.6"
                  height="6.8"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <rect
                  x="16.9"
                  y="12.8"
                  width="4.6"
                  height="6.8"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M19.2 19.3v.4a2 2 0 0 1-2 2h-3.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[26px] font-bold tracking-[0.02em] md:text-[38px]">{sitePhone}</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter sitePhone={sitePhone} />
    </div>
  );
}
