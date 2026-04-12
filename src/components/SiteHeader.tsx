"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";

import { AUTH_UPDATED_EVENT } from "@/lib/auth-client";
import { CART_UPDATED_EVENT, getLocalCartCount } from "@/lib/cart";

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DisclosureIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 text-[#617087] transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="m6.5 9.5 5.5 5 5.5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
  icon: ReactNode;
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
  icon: ReactNode;
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

function MobileCategoryAccordion({
  nodes,
  expandedKeys,
  onToggle,
  onSelect,
  depth = 0,
  path = "mobile-root",
}: {
  nodes: CategoryNode[];
  expandedKeys: Record<string, boolean>;
  onToggle: (key: string) => void;
  onSelect?: () => void;
  depth?: number;
  path?: string;
}) {
  return (
    <ul className={depth === 0 ? "space-y-1.5" : "mt-2 space-y-1.5 border-l border-[#e8edf5] pl-3"}>
      {nodes.map((node, index) => {
        const key = `${path}-${index}-${node.slug ?? node.name}`;
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isOpen = Boolean(expandedKeys[key]);
        const textClass =
          depth === 0 ? "text-[13px] font-semibold text-[#263142]" : "text-[13px] font-medium text-[#344357]";

        return (
          <li key={key}>
            <div className="flex items-center gap-2 rounded-md border border-[#e8edf5] bg-white px-2.5 py-2">
              {node.slug ? (
                <Link
                  href={`/danh-muc/${node.slug}`}
                  onClick={onSelect}
                  className={`min-w-0 flex-1 truncate leading-5 transition hover:text-[#8f6f11] ${textClass}`}
                >
                  {node.name}
                </Link>
              ) : (
                <span className={`min-w-0 flex-1 truncate leading-5 ${textClass}`}>{node.name}</span>
              )}

              {hasChildren ? (
                <button
                  type="button"
                  aria-label={isOpen ? "Thu gọn danh mục con" : "Mở danh mục con"}
                  aria-expanded={isOpen}
                  onClick={() => onToggle(key)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d8e0eb] bg-[#f8fafd]"
                >
                  <DisclosureIcon open={isOpen} />
                </button>
              ) : null}
            </div>

            {hasChildren && isOpen ? (
              <MobileCategoryAccordion
                nodes={node.children as CategoryNode[]}
                expandedKeys={expandedKeys}
                onToggle={onToggle}
                onSelect={onSelect}
                depth={depth + 1}
                path={key}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

type HomeApiPayload = {
  collectionLinks?: Array<{
    name?: string;
    slug?: string;
  }>;
  categoryTree?: CategoryNode[];
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

type HeaderAuthUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type HeaderAuthMeResponse = {
  authenticated: boolean;
  user?: HeaderAuthUser;
};

const getHeaderDisplayName = (user: HeaderAuthUser | null) => {
  if (!user) {
    return "";
  }

  const fullName = user.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const email = user.email?.trim();
  if (!email) {
    return "Tài khoản";
  }

  const localPart = email.split("@")[0]?.trim();
  return localPart || email;
};

export default function SiteHeader() {
  const [collectionLinks, setCollectionLinks] = useState<HeaderCollectionLink[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [siteBrandName, setSiteBrandName] = useState("Tổ Ấm Hoàn Hảo");
  const [siteBrandTagline, setSiteBrandTagline] = useState("Nội thất xuất khẩu");
  const [sitePhone, setSitePhone] = useState("0901.827.555");
  const [currentUser, setCurrentUser] = useState<HeaderAuthUser | null>(null);
  const [cartCount, setCartCount] = useState(() => (typeof window === "undefined" ? 0 : getLocalCartCount()));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedKeys, setMobileExpandedKeys] = useState<Record<string, boolean>>({});
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategoryName, setActiveMegaCategoryName] = useState("");
  const megaMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
      return;
    }
    setMobileExpandedKeys({});
    setIsMobileMenuOpen(true);
  };

  useEffect(
    () => () => {
      clearMegaMenuCloseTimer();
    },
    [],
  );

  useEffect(() => {
    let ignore = false;

    const loadHeaderData = async () => {
      try {
        const response = await fetch(`/api/home?take=8&ts=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!ignore) {
            setCollectionLinks([]);
            setCategoryTree([]);
          }
          return;
        }

        const payload = (await response.json()) as HomeApiPayload;

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

          setCollectionLinks(normalizedCollectionLinks);
          setCategoryTree(Array.isArray(payload.categoryTree) ? payload.categoryTree : []);

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
          setCollectionLinks([]);
          setCategoryTree([]);
        }
      }
    };

    void loadHeaderData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getLocalCartCount());
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount as EventListener);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount as EventListener);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncAuthState = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as HeaderAuthMeResponse;
        if (ignore) {
          return;
        }

        if (!response.ok || !payload.authenticated || !payload.user) {
          setCurrentUser(null);
          return;
        }

        setCurrentUser(payload.user);
      } catch {
        if (!ignore) {
          setCurrentUser(null);
        }
      }
    };

    const handleAuthUpdated = () => {
      void syncAuthState();
    };

    void syncAuthState();
    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);

    return () => {
      ignore = true;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    };
  }, []);

  const accountTitle = currentUser ? getHeaderDisplayName(currentUser) : "Đăng nhập";
  const accountSubtitle = currentUser ? "Tài khoản" : "Đăng ký";

  const toggleMobileCategory = (key: string) => {
    setMobileExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
    <header className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#d7d9de] bg-[#f1f2f4] md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            aria-label="Mở menu"
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
            className="inline-flex text-[#cfb345] transition-transform duration-200 active:scale-95"
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
            <MobileRoundIcon
              icon={<CartIcon />}
              href="/gio-hang"
              ariaLabel="Giỏ hàng"
              badge={cartCount > 0 ? String(Math.min(cartCount, 99)) : undefined}
            />
          </div>
        </div>

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

      <div
        className={`fixed inset-0 z-[110] md:hidden transition-[visibility] duration-300 ${
          isMobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
        role={isMobileMenuOpen ? "dialog" : undefined}
        aria-modal={isMobileMenuOpen ? true : undefined}
        aria-label="Menu danh mục"
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-[rgba(15,23,42,0.44)] transition-opacity duration-300 ease-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-[85vw] max-w-[360px] flex-col bg-white shadow-[0_20px_46px_rgba(15,23,42,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <div className="flex items-center justify-between border-b border-[#e8ecf3] px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9a7f1a]">Danh mục sản phẩm</p>
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Đóng menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dce3ed] bg-white text-[#4a5465]"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
              <nav className="grid gap-2">
                {mobileMenuLinks.map((item) => (
                  <Link
                    key={`mobile-menu-${item.href}`}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="rounded-md border border-[#e7ebf2] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#2b3240] transition hover:bg-[#f5f7fb]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {categoryTree.length > 0 ? (
                <div className="mt-4 border-t border-[#eceff3] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">Danh mục chính</p>
                  <div className="mt-2 rounded-lg border border-[#e7ebf1] bg-[#fafbfd] p-3 normal-case">
                    <MobileCategoryAccordion
                      nodes={categoryTree}
                      expandedKeys={mobileExpandedKeys}
                      onToggle={toggleMobileCategory}
                      onSelect={closeMobileMenu}
                    />
                  </div>
                </div>
              ) : null}

              {collectionLinks.length > 0 ? (
                <div className="mt-4 border-t border-[#eceff3] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7f1a]">
                    Bộ sưu tập nổi bật
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {collectionLinks.slice(0, 6).map((item) => (
                      <Link
                        key={`mobile-collection-${item.slug}`}
                        href={`/bo-suu-tap/${item.slug}`}
                        onClick={closeMobileMenu}
                        className="rounded-full border border-[#d7dbe2] px-2.5 py-1 text-[12px] font-medium text-[#3b4453]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
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
          <a href={`tel:${sitePhone}`} className="shrink-0 text-[15px] font-semibold text-[#ee3b2e] md:text-[16px]">
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
          <ActionItem icon={<PersonIcon />} title={accountTitle} subtitle={accountSubtitle} href="/tai-khoan" />
          <ActionItem icon={<StoreIcon />} title="Hệ thống" subtitle="cửa hàng" href="/he-thong-cua-hang" />
          <ActionItem
            icon={<PhoneIcon />}
            title="Hỗ trợ"
            subtitle="khách hàng"
            href="/lien-he"
          />

          <Link
            href="/gio-hang"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dde6] bg-white text-[#222a36] shadow-[0_2px_8px_rgba(15,23,42,0.1)] transition hover:scale-105 hover:border-[#c7cfdb] hover:shadow-[0_5px_14px_rgba(15,23,42,0.16)]"
            aria-label="Giỏ hàng"
          >
            <CartIcon />
            {cartCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ecea3b] text-[11px] font-semibold text-[#1e1e1e]">
                {Math.min(cartCount, 99)}
              </span>
            ) : null}
          </Link>
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
                                <h4 className="normal-case text-[15px] font-bold text-[#1f2937]">{branch.name}</h4>
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
  );
}
