"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  CART_UPDATED_EVENT,
  clearLocalCart,
  readLocalCart,
  removeLocalCartItem,
  updateLocalCartItemQuantity,
  type LocalCartItem,
} from "@/lib/cart";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

const getItemTotal = (item: LocalCartItem) => Math.max(0, item.price) * item.quantity;

const MAX_QUANTITY = 99;

export default function CartPageView() {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    const syncFromStorage = () => {
      setItems(readLocalCart());
    };

    syncFromStorage();

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(CART_UPDATED_EVENT, syncFromStorage as EventListener);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(CART_UPDATED_EVENT, syncFromStorage as EventListener);
    };
  }, []);

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getItemTotal(item), 0), [items]);

  const handleIncrease = (item: LocalCartItem) => {
    if (item.quantity >= MAX_QUANTITY) {
      return;
    }

    const nextItems = updateLocalCartItemQuantity(item.key, item.quantity + 1);
    setItems(nextItems);
  };

  const handleDecrease = (item: LocalCartItem) => {
    if (item.quantity <= 1) {
      const nextItems = removeLocalCartItem(item.key);
      setItems(nextItems);
      return;
    }

    const nextItems = updateLocalCartItemQuantity(item.key, item.quantity - 1);
    setItems(nextItems);
  };

  const handleRemove = (item: LocalCartItem) => {
    const nextItems = removeLocalCartItem(item.key);
    setItems(nextItems);
  };

  const handleClearAll = () => {
    clearLocalCart();
    setItems([]);
  };

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 md:pt-8">
      <nav className="text-[13px] text-[#6b7280]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[#907217]">
              Trang chủ
            </Link>
          </li>
          <li>›</li>
          <li className="font-medium text-[#2b3342]">Giỏ hàng</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold tracking-[0.01em] text-[#1f2937] md:text-[36px]">Giỏ hàng của bạn</h1>
          <p className="mt-1 text-[14px] text-[#5b6678]">
            {totalQuantity > 0
              ? `${totalQuantity} sản phẩm đang chờ thanh toán.`
              : "Chưa có sản phẩm nào trong giỏ hàng."}
          </p>
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-full border border-[#e2d6ae] bg-[#fff8df] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#7d6211] transition hover:bg-[#fdf0c7]"
          >
            Xóa toàn bộ
          </button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-[#e3e6ec] bg-white p-8 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-[15px] text-[#596273]">Giỏ hàng đang trống. Hãy chọn sản phẩm bạn muốn trước nhé.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45]"
            >
              Về trang chủ
            </Link>
            <Link
              href="/san-pham-moi"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
            >
              Xem sản phẩm mới
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.key}
                className="grid gap-4 rounded-2xl border border-[#e3e6ec] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] md:grid-cols-[130px_minmax(0,1fr)]"
              >
                <Link
                  href={`/san-pham/${item.slug}`}
                  className="relative block aspect-square overflow-hidden rounded-xl border border-[#e6e9ef] bg-[#f4f6f9]"
                >
                  <Image
                    src={item.image || "/products/p1.jpg"}
                    alt={item.name}
                    fill
                    sizes="130px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-col gap-3">
                  <div>
                    <Link
                      href={`/san-pham/${item.slug}`}
                      className="line-clamp-2 text-[17px] font-semibold leading-[1.35] text-[#1f2937] transition hover:text-[#9a7f1a]"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel ? (
                      <p className="mt-1 text-[13px] text-[#6a7484]">Phân loại: {item.variantLabel}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-[#d1d6df] bg-white">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item)}
                        className="h-9 w-9 text-[20px] leading-none text-[#374152] transition hover:bg-[#f3f5f8]"
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="inline-flex h-9 min-w-10 items-center justify-center border-x border-[#d1d6df] px-3 text-[14px] font-semibold text-[#1f2937]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(item)}
                        className="h-9 w-9 text-[20px] leading-none text-[#374152] transition hover:bg-[#f3f5f8]"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="text-[13px] font-medium text-[#b42318] transition hover:text-[#8f1f14]"
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[#edf0f4] pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isContactPrice(item.price, item.originalPrice) ? (
                        <span className="text-[18px] font-bold text-[#bf1f15]">Liên Hệ</span>
                      ) : (
                        <>
                          <span className="text-[18px] font-bold text-[#bf1f15]">{formatVnd(item.price)}</span>
                          {item.originalPrice && item.originalPrice > item.price ? (
                            <span className="text-[13px] font-medium text-[#8b8f98] line-through">
                              {formatVnd(item.originalPrice)}
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>

                    <p className="text-[14px] font-semibold text-[#2f3947]">
                      Thành tiền: {isContactPrice(item.price, item.originalPrice) ? "Liên hệ" : formatVnd(getItemTotal(item))}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:sticky lg:top-6">
            <h2 className="text-[19px] font-bold text-[#1f2937]">Tóm tắt đơn hàng</h2>
            <div className="mt-4 space-y-2 text-[14px] text-[#4b5565]">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#253041]">{formatVnd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vận chuyển</span>
                <span className="font-semibold text-[#253041]">Miễn phí tạm tính</span>
              </div>
            </div>
            <div className="mt-4 border-t border-[#edf0f4] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#273245]">Tổng cộng</span>
                <span className="text-[22px] font-bold text-[#bf1f15]">{formatVnd(subtotal)}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <Link
                href="/thanh-toan"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45]"
              >
                Tiến hành thanh toán
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
