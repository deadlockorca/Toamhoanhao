"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/variants", label: "Biến thể" },
  { href: "/admin/collections", label: "Bộ sưu tập" },
  { href: "/admin/orders", label: "Đơn hàng" },
];

export default function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {adminLinks.map((link) => {
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
    </nav>
  );
}

