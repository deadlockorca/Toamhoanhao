"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { AdminSection } from "@/lib/admin-auth";

const adminLinks = [
  { href: "/admin/products", label: "Sản phẩm", section: "products" as const },
  { href: "/admin/variants", label: "Biến thể", section: "variants" as const },
  { href: "/admin/banners", label: "Banner", section: "banners" as const },
  { href: "/admin/orders", label: "Đơn hàng", section: "orders" as const },
  { href: "/admin/users", label: "Khách hàng", section: "users" as const },
  { href: "/admin/staff", label: "Nhân sự", section: "staff" as const },
];

type AdminMeResponse = {
  role?: string;
  roleLabel?: string;
  username?: string;
  sections?: AdminSection[];
  error?: string;
};

export default function AdminSectionNav() {
  const pathname = usePathname();
  const [allowedSections, setAllowedSections] = useState<AdminSection[] | null>(null);
  const [roleLabel, setRoleLabel] = useState<string>("");

  useEffect(() => {
    let ignore = false;

    const loadAdminContext = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as AdminMeResponse;
        if (!response.ok) {
          return;
        }

        if (ignore) {
          return;
        }

        if (Array.isArray(payload.sections)) {
          setAllowedSections(payload.sections);
        }

        if (typeof payload.roleLabel === "string" && payload.roleLabel.trim()) {
          setRoleLabel(payload.roleLabel.trim());
        }
      } catch {
        if (!ignore) {
          setAllowedSections(null);
          setRoleLabel("");
        }
      }
    };

    void loadAdminContext();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleLinks = useMemo(() => {
    if (!allowedSections || allowedSections.length === 0) {
      return adminLinks;
    }

    return adminLinks.filter((link) => allowedSections.includes(link.section));
  }, [allowedSections]);

  return (
    <div className="space-y-2">
      <nav className="flex flex-wrap gap-2">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition ${
                isActive
                  ? "border-[#1f2329] bg-[#1f2329] text-white"
                  : "border-[#cfd3da] text-[#2f3642] hover:bg-[#f3f4f7]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <a
          href="/admin/switch-account"
          className="rounded-lg border border-[#e0b94f] bg-[#fff7de] px-3 py-1.5 text-[13px] font-medium text-[#7a5a00] transition hover:bg-[#ffefc0]"
        >
          Đổi tài khoản
        </a>
      </nav>
      {roleLabel ? <p className="text-[12px] text-[#6a7280]">Vai trò hiện tại: {roleLabel}</p> : null}
    </div>
  );
}
