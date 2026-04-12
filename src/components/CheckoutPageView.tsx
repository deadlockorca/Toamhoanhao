"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { CART_UPDATED_EVENT, clearLocalCart, readLocalCart, type LocalCartItem } from "@/lib/cart";

type CheckoutPaymentMethod = "COD" | "BANK_TRANSFER" | "CARD" | "WALLET" | "OTHER";

type CheckoutFormState = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  province: string;
  district: string;
  ward: string;
  customerNote: string;
  paymentMethod: CheckoutPaymentMethod;
};

type CheckoutApiSuccess = {
  order?: {
    id: string;
    orderNumber: string;
    grandTotal: number;
    createdAt: string;
  };
};

type CheckoutApiError = {
  error?: string;
};

const initialFormState: CheckoutFormState = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  province: "",
  district: "",
  ward: "",
  customerNote: "",
  paymentMethod: "COD",
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

const getLineTotal = (item: LocalCartItem) => Math.max(0, item.price) * item.quantity;

const PAYMENT_METHOD_OPTIONS: Array<{ value: CheckoutPaymentMethod; label: string; hint: string }> = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    hint: "Khách thanh toán trực tiếp cho nhân viên giao hàng.",
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    hint: "Nhân viên sẽ liên hệ xác nhận thông tin chuyển khoản sau khi đặt đơn.",
  },
];

export default function CheckoutPageView() {
  const router = useRouter();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [form, setForm] = useState<CheckoutFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getLineTotal(item), 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || null,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          province: form.province || null,
          district: form.district || null,
          ward: form.ward || null,
          customerNote: form.customerNote || null,
          paymentMethod: form.paymentMethod,
          shippingFee: 0,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json()) as CheckoutApiSuccess & CheckoutApiError;

      if (!response.ok) {
        throw new Error(payload.error || "Không thể tạo đơn hàng. Vui lòng thử lại.");
      }

      const orderNumber = payload.order?.orderNumber?.trim();
      clearLocalCart();

      if (orderNumber) {
        router.push(`/dat-hang-thanh-cong?order=${encodeURIComponent(orderNumber)}`);
      } else {
        router.push("/dat-hang-thanh-cong");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thanh toán lúc này.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <nav className="text-[13px] text-[#6b7280]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[#907217]">
              Trang chủ
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href="/gio-hang" className="transition hover:text-[#907217]">
              Giỏ hàng
            </Link>
          </li>
          <li>›</li>
          <li className="font-medium text-[#2b3342]">Thanh toán</li>
        </ol>
      </nav>

      <header className="mt-4">
        <h1 className="text-[30px] font-bold tracking-[0.01em] text-[#1f2937] md:text-[36px]">Thanh toán đơn hàng</h1>
        <p className="mt-1 text-[14px] text-[#5b6678]">Điền thông tin giao hàng để hoàn tất đặt mua nhanh.</p>
      </header>

      {items.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-[#e3e6ec] bg-white p-8 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-[15px] text-[#596273]">Giỏ hàng đang trống nên chưa thể thanh toán.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/gio-hang"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
            >
              Về giỏ hàng
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45]"
            >
              Chọn sản phẩm
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[13px] font-semibold text-[#364152]">Họ và tên</span>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  required
                  autoComplete="name"
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[13px] font-semibold text-[#364152]">Số điện thoại</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  required
                  autoComplete="tel"
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[13px] font-semibold text-[#364152]">Email (không bắt buộc)</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  autoComplete="email"
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[13px] font-semibold text-[#364152]">Địa chỉ giao hàng</span>
                <input
                  value={form.addressLine1}
                  onChange={(event) => setForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                  required
                  autoComplete="street-address"
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[13px] font-semibold text-[#364152]">Địa chỉ bổ sung (không bắt buộc)</span>
                <input
                  value={form.addressLine2}
                  onChange={(event) => setForm((prev) => ({ ...prev, addressLine2: event.target.value }))}
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[13px] font-semibold text-[#364152]">Tỉnh/Thành</span>
                <input
                  value={form.province}
                  onChange={(event) => setForm((prev) => ({ ...prev, province: event.target.value }))}
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[13px] font-semibold text-[#364152]">Quận/Huyện</span>
                <input
                  value={form.district}
                  onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[13px] font-semibold text-[#364152]">Phường/Xã</span>
                <input
                  value={form.ward}
                  onChange={(event) => setForm((prev) => ({ ...prev, ward: event.target.value }))}
                  className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
                />
              </label>
            </div>

            <fieldset className="mt-5 rounded-xl border border-[#e4e8ef] p-4">
              <legend className="px-2 text-[13px] font-semibold text-[#364152]">Hình thức thanh toán</legend>
              <div className="grid gap-2">
                {PAYMENT_METHOD_OPTIONS.map((option) => {
                  const checked = form.paymentMethod === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-lg border px-3 py-3 transition ${
                        checked
                          ? "border-[#cfb45d] bg-[#fff8de]"
                          : "border-[#e2e6ee] bg-white hover:border-[#d3d9e4]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={checked}
                        onChange={() => setForm((prev) => ({ ...prev, paymentMethod: option.value }))}
                        className="sr-only"
                      />
                      <p className="text-[14px] font-semibold text-[#2f3947]">{option.label}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">{option.hint}</p>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="mt-5 grid gap-1.5">
              <span className="text-[13px] font-semibold text-[#364152]">Ghi chú đơn hàng (không bắt buộc)</span>
              <textarea
                value={form.customerNote}
                onChange={(event) => setForm((prev) => ({ ...prev, customerNote: event.target.value }))}
                rows={4}
                className="rounded-lg border border-[#d4dae4] px-3 py-2.5 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
              />
            </label>

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-[#f2b7b7] bg-[#fff3f3] px-3 py-2 text-[13px] font-medium text-[#b42318]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang tạo đơn..." : "Đặt hàng ngay"}
              </button>

              <Link
                href="/gio-hang"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:sticky lg:top-6">
            <h2 className="text-[19px] font-bold text-[#1f2937]">Đơn hàng ({totalQuantity})</h2>
            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <article key={`checkout-item-${item.key}`} className="flex gap-3 rounded-xl border border-[#edf0f4] p-2.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f4f6f9]">
                    <Image
                      src={item.image || "/products/p1.jpg"}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-[1.35] text-[#1f2937]">{item.name}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">SL: {item.quantity}</p>
                    <p className="mt-1 text-[13px] font-semibold text-[#bf1f15]">
                      {isContactPrice(item.price, item.originalPrice) ? "Liên hệ" : formatVnd(getLineTotal(item))}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 border-t border-[#edf0f4] pt-4">
              <div className="flex items-center justify-between text-[14px] text-[#4b5565]">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#253041]">{formatVnd(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[14px] text-[#4b5565]">
                <span>Vận chuyển</span>
                <span className="font-semibold text-[#253041]">Miễn phí tạm tính</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#edf0f4] pt-3">
                <span className="text-[15px] font-semibold text-[#273245]">Tổng thanh toán</span>
                <span className="text-[22px] font-bold text-[#bf1f15]">{formatVnd(subtotal)}</span>
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
