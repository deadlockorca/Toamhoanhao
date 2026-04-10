"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/components/SiteFooter";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c2.4 2.4 3.6 6.5 3.6 10S14.4 19.6 12 22c-2.4-2.4-3.6-6.5-3.6-10S9.6 4.4 12 2Zm-8 10h16M5 7.5h14M5 16.5h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m21 21-4.4-4.4m1.4-5.1a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Zm2-4h12l1 4H5l1-4Zm4 7h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M6.7 3h3.1L11 7.2 8.8 9.1a13.7 13.7 0 0 0 6.1 6.1l1.9-2.2 4.2 1.2v3.1a1.7 1.7 0 0 1-1.8 1.7A16.2 16.2 0 0 1 5 4.8 1.7 1.7 0 0 1 6.7 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3 4h2l1.3 8.1a1 1 0 0 0 1 .9h9.6a1 1 0 0 0 1-.8L20 7H6.1M10 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function MobileRoundIcon({
  icon,
  href,
  ariaLabel,
  badge,
}: {
  icon: React.ReactNode;
  href?: string;
  ariaLabel: string;
  badge?: string;
}) {
  const content = (
    <>
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ecea3b] px-1 text-[10px] font-semibold text-[#1e1e1e]">
          {badge}
        </span>
      ) : null}
    </>
  );

  const className =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8dde6] bg-white text-[#222a36] shadow-[0_2px_8px_rgba(15,23,42,0.1)] transition hover:border-[#c7cfdb] hover:shadow-[0_5px_14px_rgba(15,23,42,0.16)]";

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={ariaLabel} className={className}>
      {content}
    </button>
  );
}

function ActionItem({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
}) {
  const baseClass =
    "group flex items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-[#f6f6f6]";
  const content = (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dde6] bg-white text-[#222a36] shadow-[0_2px_8px_rgba(15,23,42,0.1)] transition group-hover:scale-105 group-hover:border-[#c7cfdb] group-hover:shadow-[0_5px_14px_rgba(15,23,42,0.16)]">
        {icon}
      </span>
      <span className="text-[0.93rem] font-medium leading-5 text-[#121212]">
        {title}
        {subtitle ? <span className="block">{subtitle}</span> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClass}>
      {content}
    </button>
  );
}

type CategoryNode = {
  id?: string;
  slug?: string;
  name: string;
  children?: CategoryNode[];
};

function CategoryTreeList({
  nodes,
  depth = 0,
  path = "root",
  onSelect,
}: {
  nodes: CategoryNode[];
  depth?: number;
  path?: string;
  onSelect?: () => void;
}) {
  const markerClass =
    depth === 0 ? "text-[#b78a06]" : depth === 1 ? "text-[#7d8796]" : "text-[#9aa2ae]";
  const textClass =
    depth === 0
      ? "text-[14px] font-semibold text-[#202630]"
      : depth === 1
        ? "text-[13px] font-medium text-[#2b3342]"
        : "text-[13px] text-[#475467]";

  return (
    <ul className={depth === 0 ? "space-y-3" : "space-y-2"}>
      {nodes.map((node, index) => {
        const key = `${path}-${index}-${node.name}`;
        const marker = depth === 0 ? "◆" : depth === 1 ? "•" : "–";

        return (
          <li key={key}>
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 leading-none ${markerClass}`}>{marker}</span>
              {node.slug ? (
                <Link
                  href={`/danh-muc/${node.slug}`}
                  onClick={onSelect}
                  className={`${textClass} leading-5 transition hover:text-[#9a7f1a]`}
                >
                  {node.name}
                </Link>
              ) : (
                <span className={`${textClass} leading-5`}>{node.name}</span>
              )}
            </div>
            {node.children && node.children.length > 0 ? (
              <div className="ml-3 mt-2 border-l border-[#eef3f8] pl-3">
                <CategoryTreeList
                  nodes={node.children}
                  depth={depth + 1}
                  path={key}
                  onSelect={onSelect}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

type PrimaryMenuItem = {
  label: string;
  href?: string;
};

const primaryMenu: PrimaryMenuItem[] = [
  { label: "Danh mục sản phẩm" },
  { label: "Giảm giá", href: "/giam-gia" },
  { label: "Sản phẩm mới", href: "/san-pham-moi" },
  { label: "Bán chạy nhất", href: "/ban-chay" },
  { label: "Bộ sưu tập", href: "/bo-suu-tap" },
  { label: "Liên hệ", href: "/lien-he" },
  { label: "Tin tức", href: "#" },
];

type HeaderCollectionLink = {
  name: string;
  slug: string;
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
  collectionLinks?: Array<{
    name?: string;
    slug?: string;
  }>;
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
  const [collectionLinks, setCollectionLinks] = useState<HeaderCollectionLink[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [heroBanners, setHeroBanners] = useState<BannerItem[]>([]);
  const [popupBanner, setPopupBanner] = useState<PopupBannerItem | null>(null);
  const [siteBrandName, setSiteBrandName] = useState("Tổ Ấm Hoàn Hảo");
  const [siteBrandTagline, setSiteBrandTagline] = useState("Nội thất xuất khẩu");
  const [sitePhone, setSitePhone] = useState("0901.827.555");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
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
  const [activeMegaCategoryName, setActiveMegaCategoryName] = useState("");
  const [databaseProductData, setDatabaseProductData] = useState<Record<ProductTabId, ProductItem[]>>({
    new: [],
    best: [],
    sale: [],
  });
  const [collectionCards, setCollectionCards] = useState<CollectionShowcaseItem[]>([]);
  const megaMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const activeMegaCategory =
    categoryTree.find((category) => category.name === activeMegaCategoryName) ?? categoryTree[0] ?? null;

  const clearMegaMenuCloseTimer = () => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
  };

  const openMegaMenu = () => {
    if (categoryTree.length === 0) {
      return;
    }
    clearMegaMenuCloseTimer();
    setIsMegaMenuOpen(true);
  };

  const closeMegaMenuWithDelay = () => {
    clearMegaMenuCloseTimer();
    megaMenuCloseTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 180);
  };

  const closeMegaMenuNow = () => {
    clearMegaMenuCloseTimer();
    setIsMegaMenuOpen(false);
  };

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

  useEffect(
    () => () => {
      clearMegaMenuCloseTimer();
    },
    [],
  );

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
          const normalizedCollectionLinks = Array.isArray(payload.collectionLinks)
            ? payload.collectionLinks
                .map((item) => {
                  const name = typeof item?.name === "string" ? item.name.trim() : "";
                  const slug = typeof item?.slug === "string" ? item.slug.trim() : "";
                  return name && slug ? { name, slug } : null;
                })
                .filter((item): item is HeaderCollectionLink => item !== null)
            : [];
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

          setCollectionLinks(normalizedCollectionLinks);
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
          setCollectionLinks([]);
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

  const mobileMenuLinks: Array<{ label: string; href: string }> = [
    ...primaryMenu
      .slice(1)
      .filter((item) => item.href && item.href !== "#")
      .map((item) => ({
        label: item.label,
        href: item.href as string,
      })),
  ];

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
            aria-label="Ưu đãi độc quyền"
            className="relative z-[1] w-full max-w-[520px] overflow-visible rounded-[22px] border border-[#e2c850] bg-[linear-gradient(165deg,#ffe45f_0%,#f5d437_62%,#efca1f_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[22px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.45),rgba(255,255,255,0)_38%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-[48%] bg-[repeating-linear-gradient(90deg,rgba(133,103,16,0.08)_0px,rgba(133,103,16,0.08)_1px,transparent_1px,transparent_24px)]" />
              <div className="absolute right-[-40px] top-[196px] h-[300px] w-[300px] rounded-full bg-white/95" />
            </div>

            <button
              type="button"
              aria-label="Đóng"
              onClick={closePromoPopup}
              className="absolute right-3 top-3 z-[30] inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dadada] bg-white/95 text-[22px] leading-none text-[#595959] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:bg-white"
            >
              ×
            </button>

            <div className="relative z-[2] px-5 pb-5 pt-6 pr-[112px] md:px-6 md:pb-6 md:pt-7 md:pr-[142px]">
              <div className="w-fit border-b border-[#c6a10f] pb-1">
                <p className="font-serif text-[24px] font-semibold uppercase leading-none tracking-[0.03em] text-[#8b6d00]">
                  {siteBrandName}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#96780e]">
                  {siteBrandTagline}
                </p>
              </div>

              <h2 className="mt-4 text-[52px] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white drop-shadow-[0_2px_0_rgba(35,35,35,0.95)] md:text-[58px]">
                {promoTitle}
              </h2>
              <p className="mt-1 text-[34px] font-extrabold leading-[1.02] tracking-[-0.02em] text-[#101010] md:text-[40px]">
                {promoSubtitle}
              </p>
              <p className="mt-1 text-[118px] font-black leading-[0.9] tracking-[-0.03em] text-white drop-shadow-[0_4px_0_rgba(20,20,20,0.9)] md:text-[132px]">
                -50%
              </p>

              <div className="mt-4 flex h-[6px] w-[200px] overflow-hidden rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
                <span className="w-[45%] bg-[#2f9e44]" />
                <span className="w-[20%] bg-[#fff7d6]" />
                <span className="w-[35%] bg-[#c93838]" />
              </div>

              <Link
                href={promoCtaHref}
                onClick={closePromoPopup}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-[10px] border border-[#d5d5d5] bg-white px-7 text-[19px] font-bold uppercase tracking-[0.04em] text-[#b63d2f] shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition hover:-translate-y-[1px] hover:bg-[#fffdf8]"
              >
                {promoCtaLabel}
              </Link>
            </div>

            {promoImage ? (
              <div className="pointer-events-none absolute -bottom-8 -right-[190px] z-[6] h-[340px] w-[420px] md:-bottom-10 md:-right-[220px] md:h-[382px] md:w-[468px]">
                <Image
                  src={promoImage}
                  alt={popupBanner?.alt || "Ưu đãi sofa"}
                  fill
                  sizes="(max-width: 768px) 420px, 468px"
                  className="object-cover object-[86%_78%] scale-[1.16] drop-shadow-[0_16px_26px_rgba(0,0,0,0.22)]"
                />
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      <header className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#d7d9de] bg-[#f1f2f4] md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex text-[#c9a22f]"
            >
              <MenuIcon />
            </button>

            <Link href="/" aria-label="Về trang chủ" className="block w-[126px]">
              <p className="text-center font-serif text-[9px] font-semibold leading-[1.08] tracking-[0.03em] text-[#c9a22f]">
                <span className="inline-flex items-center gap-[0.18em]">
                  <span>TỔ</span>
                  <span>ẤM</span>
                  <span>HOÀN</span>
                  <span>HẢO</span>
                </span>
              </p>
              <p className="mt-0.5 text-center text-[6px] font-semibold tracking-[0.14em] text-[#c9a22f]">
                NỘI THẤT XUẤT KHẨU
              </p>
              <div className="mt-1 h-px w-full bg-[#cfb151]" />
            </Link>

            <div className="flex items-center gap-2">
              <MobileRoundIcon icon={<PersonIcon />} href="/tai-khoan" ariaLabel="Tài khoản" />
              <MobileRoundIcon icon={<StoreIcon />} href="/he-thong-cua-hang" ariaLabel="Hệ thống cửa hàng" />
              <MobileRoundIcon icon={<PhoneIcon />} href="/lien-he" ariaLabel="Hỗ trợ khách hàng" />
              <MobileRoundIcon icon={<CartIcon />} ariaLabel="Giỏ hàng" badge="0" />
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div className="border-t border-[#d7d9de] bg-white px-4 py-3">
              <nav className="grid gap-2">
                {mobileMenuLinks.map((item) => (
                  <Link
                    key={`mobile-menu-${item.href}`}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-md px-2 py-1.5 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#2b3240] transition hover:bg-[#f4f6fa]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {categoryTree.length > 0 ? (
                <div className="mt-3 border-t border-[#eceff3] pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">
                    Danh mục sản phẩm
                  </p>
                  <div className="mt-2 rounded-lg border border-[#e7ebf1] bg-[#fafbfd] p-3 normal-case">
                    <CategoryTreeList nodes={categoryTree} onSelect={() => setIsMobileMenuOpen(false)} />
                  </div>
                </div>
              ) : null}

              {collectionLinks.length > 0 ? (
                <div className="mt-3 border-t border-[#eceff3] pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">
                    Bộ sưu tập nổi bật
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {collectionLinks.slice(0, 6).map((item) => (
                      <Link
                        key={`mobile-collection-${item.slug}`}
                        href={`/bo-suu-tap/${item.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-full border border-[#d7dbe2] px-2.5 py-1 text-[12px] font-medium text-[#3b4453]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="px-4 pb-3">
            <div className="flex items-center border border-[#d2d5db] bg-white px-4 py-2.5">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-transparent text-[14px] text-[#111] placeholder:text-[#6f747d] focus:outline-none"
              />
              <button type="button" aria-label="Tìm kiếm" className="text-[#d6b62f]">
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden bg-[#e2e4e8] md:block">
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3 px-4 py-2 text-[#4f5560] md:px-6">
            <p className="flex items-center gap-2 text-[12px] font-medium md:text-[13px]">
              <GlobeIcon />
              <span className="hidden sm:inline">
                {`Chào mừng bạn đến với ${siteBrandName} - ${siteBrandTagline}`}
              </span>
              <span className="sm:hidden">{siteBrandName}</span>
            </p>
            <a
              href={`tel:${sitePhone}`}
              className="shrink-0 text-[15px] font-semibold text-[#ee3b2e] md:text-[16px]"
            >
              {sitePhone}
            </a>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-[1320px] gap-5 px-4 py-4 md:grid md:px-6 xl:grid-cols-[260px_minmax(420px,1fr)_auto] xl:items-center">
          <Link href="/" aria-label="Về trang chủ" className="block w-[110px] md:w-[120px]">
            <p className="text-center font-serif text-[13px] font-semibold leading-[1.08] tracking-[0.03em] text-[#c9a22f] md:text-[15px]">
              <span className="inline-flex items-center gap-[0.2em]">
                <span>TỔ</span>
                <span>ẤM</span>
              </span>
            </p>
            <p className="mt-1.5 text-center font-serif text-[13px] font-semibold leading-[1.08] tracking-[0.03em] text-[#c9a22f] md:text-[15px]">
              <span className="inline-flex items-center gap-[0.18em]">
                <span>HOÀN</span>
                <span>HẢO</span>
              </span>
            </p>
            <p className="mt-1 text-center text-[6px] font-semibold tracking-[0.16em] text-[#c9a22f] md:text-[7px]">
              NỘI THẤT XUẤT KHẨU
            </p>
            <div className="mt-2 h-px w-full bg-[#cfb151]" />
          </Link>

          <div>
            <div className="flex items-center rounded-full border border-[#d7dbe4] bg-white px-4 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-transparent text-[15px] text-[#111] placeholder:text-[#b5b5b5] focus:outline-none md:text-[16px]"
              />
              <button
                type="button"
                aria-label="Tìm kiếm"
                className="shrink-0 rounded-full p-1 text-[#161616] transition hover:bg-[#f2f2f2]"
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[15px] lg:justify-end">
            <ActionItem icon={<PersonIcon />} title="Đăng nhập" subtitle="Đăng ký" href="/tai-khoan" />
            <ActionItem icon={<StoreIcon />} title="Hệ thống" subtitle="cửa hàng" href="/he-thong-cua-hang" />
            <ActionItem
              icon={<PhoneIcon />}
              title="Hỗ trợ"
              subtitle="khách hàng"
              href="/lien-he"
            />

            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dde6] bg-white text-[#222a36] shadow-[0_2px_8px_rgba(15,23,42,0.1)] transition hover:scale-105 hover:border-[#c7cfdb] hover:shadow-[0_5px_14px_rgba(15,23,42,0.16)]"
              aria-label="Giỏ hàng"
            >
              <CartIcon />
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ecea3b] text-[11px] font-semibold text-[#1e1e1e]">
                0
              </span>
            </button>
          </div>
        </div>

        <div className="hidden bg-[#bfc1c6] md:block">
          <nav className="mx-auto flex w-full max-w-[1320px] gap-6 overflow-x-auto px-4 py-3 text-[13px] font-semibold uppercase tracking-tight text-[#2f3642] md:px-6 md:text-[14px] lg:overflow-visible">
            <div
              className="relative pb-1"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenuWithDelay}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  closeMegaMenuNow();
                }
              }}
            >
              <button
                type="button"
                aria-expanded={isMegaMenuOpen}
                onMouseEnter={openMegaMenu}
                onFocus={openMegaMenu}
                onClick={() => {
                  if (categoryTree.length === 0) {
                    return;
                  }
                  clearMegaMenuCloseTimer();
                  setIsMegaMenuOpen((prev) => !prev);
                }}
                className="shrink-0 whitespace-nowrap transition hover:text-[#84680e]"
              >
                {primaryMenu[0].label} ›
              </button>

              <div
                onMouseEnter={openMegaMenu}
                className={`absolute left-0 top-full z-50 mt-1 hidden w-[min(1120px,92vw)] overflow-hidden rounded-2xl border border-[#eef3f8] bg-white shadow-[0_20px_38px_rgba(15,23,42,0.14)] transition duration-200 lg:block ${
                  isMegaMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <div className="grid max-h-[70vh] grid-cols-[280px_minmax(0,1fr)]">
                  <aside className="max-h-[70vh] overflow-y-auto bg-[#fafcff] p-3">
                    <div className="space-y-2">
                      {categoryTree.length > 0 ? (
                        categoryTree.map((category, index) => {
                          const childrenCount = category.children?.length ?? 0;
                          const isActive = activeMegaCategory?.name === category.name;

                          if (category.slug) {
                            return (
                              <Link
                                key={`mega-${category.name}-${index}`}
                                href={`/danh-muc/${category.slug}`}
                                onMouseEnter={() => setActiveMegaCategoryName(category.name)}
                                onFocus={() => setActiveMegaCategoryName(category.name)}
                                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left normal-case transition ${
                                  isActive
                                    ? "bg-[#fff8dd] text-[#7a5d00] shadow-[0_3px_10px_rgba(155,126,38,0.18)]"
                                    : "bg-white/80 text-[#27303f] shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)]"
                                }`}
                              >
                                <span className="text-[14px] font-semibold">{category.name}</span>
                                <span
                                  className={`ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold ${
                                    isActive
                                      ? "bg-[#f2d87c] text-[#5f4700]"
                                      : "bg-[#eef2f6] text-[#4b5563] group-hover:bg-[#e4e9f1]"
                                  }`}
                                >
                                  {childrenCount || "•"}
                                </span>
                              </Link>
                            );
                          }

                          return (
                            <button
                              key={`mega-${category.name}-${index}`}
                              type="button"
                              onMouseEnter={() => setActiveMegaCategoryName(category.name)}
                              onFocus={() => setActiveMegaCategoryName(category.name)}
                              onClick={() => setActiveMegaCategoryName(category.name)}
                              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left normal-case transition ${
                                isActive
                                  ? "bg-[#fff8dd] text-[#7a5d00] shadow-[0_3px_10px_rgba(155,126,38,0.18)]"
                                  : "bg-white/80 text-[#27303f] shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)]"
                              }`}
                            >
                              <span className="text-[14px] font-semibold">{category.name}</span>
                              <span
                                className={`ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold ${
                                  isActive
                                    ? "bg-[#f2d87c] text-[#5f4700]"
                                    : "bg-[#eef2f6] text-[#4b5563] group-hover:bg-[#e4e9f1]"
                                }`}
                              >
                                {childrenCount || "•"}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-xl bg-white p-3 text-[13px] normal-case text-[#6b7280]">
                          Chưa có danh mục trong database.
                        </div>
                      )}
                    </div>
                  </aside>

                  <div className="max-h-[70vh] overflow-y-auto p-5">
                    {activeMegaCategory ? (
                      <>
                        {activeMegaCategory.slug ? (
                          <Link
                            href={`/danh-muc/${activeMegaCategory.slug}`}
                            onClick={closeMegaMenuNow}
                            className="normal-case text-[24px] font-bold text-[#111827] transition hover:text-[#9a7f1a]"
                          >
                            {activeMegaCategory.name}
                          </Link>
                        ) : (
                          <h3 className="normal-case text-[24px] font-bold text-[#111827]">
                            {activeMegaCategory.name}
                          </h3>
                        )}
                        <p className="mt-1 normal-case text-sm text-[#6b7280]">
                          {activeMegaCategory.children?.length
                            ? `${activeMegaCategory.children.length} nhóm sản phẩm`
                            : "Danh mục này hiện chưa có nhóm con."}
                        </p>

                        {activeMegaCategory.children && activeMegaCategory.children.length > 0 ? (
                          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {activeMegaCategory.children.map((branch, index) => (
                              <article
                                key={`mega-branch-${activeMegaCategory.name}-${branch.name}-${index}`}
                                className="rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(15,23,42,0.14)]"
                              >
                                {branch.slug ? (
                                  <Link
                                    href={`/danh-muc/${branch.slug}`}
                                    onClick={closeMegaMenuNow}
                                    className="normal-case text-[15px] font-bold text-[#1f2937] transition hover:text-[#9a7f1a]"
                                  >
                                    {branch.name}
                                  </Link>
                                ) : (
                                  <h4 className="normal-case text-[15px] font-bold text-[#1f2937]">
                                    {branch.name}
                                  </h4>
                                )}
                                {branch.children && branch.children.length > 0 ? (
                                  <div className="mt-3 normal-case">
                                    <CategoryTreeList
                                      nodes={branch.children}
                                      depth={1}
                                      path={`mega-${activeMegaCategory.name}-${branch.name}-${index}`}
                                      onSelect={closeMegaMenuNow}
                                    />
                                  </div>
                                ) : branch.slug ? (
                                  <div className="mt-3 normal-case">
                                    <Link
                                      href={`/danh-muc/${branch.slug}`}
                                      onClick={closeMegaMenuNow}
                                      className="inline-flex items-center rounded-full bg-[#f8fafc] px-3 py-1 text-[12px] font-semibold text-[#394354] shadow-[inset_0_0_0_1px_rgba(196,206,220,0.7)] transition hover:bg-[#fff9e8] hover:text-[#8f6f11] hover:shadow-[inset_0_0_0_1px_rgba(212,186,99,0.8)]"
                                    >
                                      Xem sản phẩm
                                    </Link>
                                  </div>
                                ) : null}
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-5 rounded-xl bg-[#fcfdff] p-5 normal-case text-[14px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
                            Nội dung của danh mục này sẽ được cập nhật thêm trong bước tiếp theo.
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-5 rounded-xl bg-[#fcfdff] p-5 normal-case text-[14px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
                        Chưa có danh mục để hiển thị.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {primaryMenu.slice(1).map((item) => {
              if (item.href && item.href !== "#") {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="shrink-0 whitespace-nowrap transition hover:text-[#84680e]"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a key={item.label} href="#" className="shrink-0 whitespace-nowrap transition hover:text-[#84680e]">
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="hidden h-2 bg-[repeating-linear-gradient(90deg,#d2be36_0px,#e8d958_34px,#d2be36_68px)] md:block" />
      </header>

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
