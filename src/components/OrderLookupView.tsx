"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LookupOrderItem = {
  id: string;
  productName: string;
  optionSummary: string | null;
  quantity: number;
  unitPrice: number;
  originalPrice: number | null;
  lineTotal: number;
  imageUrl: string | null;
};

type LookupTimelineItem = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  toStatusLabel: string;
  note: string | null;
  createdAt: string;
};

type LookupOrderResponse = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  fulfillmentStatus: string;
  fulfillmentStatusLabel: string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    ward: string | null;
    district: string | null;
    province: string | null;
  };
  items: LookupOrderItem[];
  timeline: LookupTimelineItem[];
};

type LookupApiPayload = {
  order?: LookupOrderResponse;
  error?: string;
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusToneByCode: Record<string, string> = {
  PENDING: "bg-[#f8f1cf] text-[#8b6d14] border-[#ead89a]",
  CONFIRMED: "bg-[#eaf4ff] text-[#1f62a8] border-[#c5dcf3]",
  PROCESSING: "bg-[#efe9ff] text-[#5943a5] border-[#d8cbff]",
  SHIPPED: "bg-[#e7f5ff] text-[#0a6f8c] border-[#bee5f7]",
  DELIVERED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  COMPLETED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
  REFUNDED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  FAILED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const paymentToneByCode: Record<string, string> = {
  UNPAID: "bg-[#fff7de] text-[#8b6d14] border-[#ecdca2]",
  AUTHORIZED: "bg-[#eef3ff] text-[#334eb2] border-[#d2dcfb]",
  PAID: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  PARTIALLY_REFUNDED: "bg-[#f3efff] text-[#5d45a5] border-[#ddd3fb]",
  REFUNDED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  FAILED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const fulfillmentToneByCode: Record<string, string> = {
  PENDING: "bg-[#fff7de] text-[#8b6d14] border-[#ecdca2]",
  PACKING: "bg-[#eef3ff] text-[#334eb2] border-[#d2dcfb]",
  SHIPPED: "bg-[#e7f5ff] text-[#0a6f8c] border-[#bee5f7]",
  DELIVERED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  RETURNED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const toAddressLine = (order: LookupOrderResponse) =>
  [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.ward,
    order.customer.district,
    order.customer.province,
  ]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(", ");

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

export default function OrderLookupView() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<LookupOrderResponse | null>(null);

  useEffect(() => {
    const orderFromQuery = searchParams.get("order")?.trim();
    if (orderFromQuery) {
      setOrderNumber(orderFromQuery.toUpperCase());
    }
  }, [searchParams]);

  const customerAddress = useMemo(() => (order ? toAddressLine(order) : ""), [order]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          phone,
        }),
      });

      const payload = (await response.json()) as LookupApiPayload;

      if (!response.ok || !payload.order) {
        setOrder(null);
        setErrorMessage(payload.error || "Không thể tra cứu đơn hàng.");
        return;
      }

      setOrder(payload.order);
    } catch {
      setOrder(null);
      setErrorMessage("Không thể tra cứu đơn hàng lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
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
          <li className="font-medium text-[#2b3342]">Tra cứu đơn hàng</li>
        </ol>
      </nav>

      <header className="mt-4">
        <h1 className="text-[30px] font-bold tracking-[0.01em] text-[#1f2937] md:text-[36px]">Tra cứu đơn hàng</h1>
        <p className="mt-1 text-[14px] text-[#5b6678]">
          Nhập mã đơn và số điện thoại đặt hàng để xem trạng thái mới nhất.
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:p-6">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-[#364152]">Mã đơn hàng</span>
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
              placeholder="VD: TAH-20260413-123456"
              required
              className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-[#364152]">Số điện thoại</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Nhập số điện thoại đặt hàng"
              required
              className="h-11 rounded-lg border border-[#d4dae4] px-3 text-[14px] text-[#1f2937] focus:border-[#c3a03a] focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Đang tra cứu..." : "Tra cứu"}
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-[#f2b7b7] bg-[#fff3f3] px-3 py-2 text-[13px] font-medium text-[#b42318]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {order ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <article className="rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[#6b7280]">Mã đơn</p>
                  <h2 className="text-[28px] font-bold text-[#1f2937]">{order.orderNumber}</h2>
                </div>
                <p className="text-[13px] text-[#5b6678]">Đặt lúc: {formatDateTime(order.createdAt)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${statusToneByCode[order.status] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                >
                  {order.statusLabel}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${paymentToneByCode[order.paymentStatus] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                >
                  {order.paymentStatusLabel}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${fulfillmentToneByCode[order.fulfillmentStatus] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                >
                  {order.fulfillmentStatusLabel}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[#edf0f4] p-4">
                <p className="text-[13px] font-semibold text-[#384253]">Thông tin nhận hàng</p>
                <p className="mt-2 text-[14px] text-[#1f2937]">{order.customer.fullName || "Khách lẻ"}</p>
                <p className="mt-1 text-[13px] text-[#566074]">{order.customer.phone || "Chưa có số điện thoại"}</p>
                {customerAddress ? <p className="mt-1 text-[13px] text-[#566074]">{customerAddress}</p> : null}
              </div>
            </article>

            <article className="rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:p-6">
              <h3 className="text-[18px] font-bold text-[#1f2937]">Sản phẩm trong đơn</h3>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-[#edf0f4] p-2.5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f4f6f9]">
                      <Image
                        src={item.imageUrl || "/products/p1.jpg"}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14px] font-semibold leading-[1.35] text-[#1f2937]">{item.productName}</p>
                      {item.optionSummary ? <p className="mt-1 text-[12px] text-[#6b7280]">{item.optionSummary}</p> : null}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5b6678]">
                        <span>SL: {item.quantity}</span>
                        <span>
                          Đơn giá:{" "}
                          {isContactPrice(item.unitPrice, item.originalPrice)
                            ? "Liên hệ"
                            : formatVnd(item.unitPrice)}
                        </span>
                        <span className="font-semibold text-[#1f2937]">Thành tiền: {formatVnd(item.lineTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <h3 className="text-[18px] font-bold text-[#1f2937]">Giá trị đơn hàng</h3>
              <div className="mt-4 space-y-2 text-[14px] text-[#4b5565]">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#253041]">{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="font-semibold text-[#253041]">-{formatVnd(order.discountTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vận chuyển</span>
                  <span className="font-semibold text-[#253041]">{formatVnd(order.shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thuế</span>
                  <span className="font-semibold text-[#253041]">{formatVnd(order.taxTotal)}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-[#edf0f4] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#273245]">Tổng thanh toán</span>
                  <span className="text-[23px] font-bold text-[#bf1f15]">{formatVnd(order.grandTotal)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e3e6ec] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <h3 className="text-[18px] font-bold text-[#1f2937]">Lịch sử trạng thái</h3>
              {order.timeline.length === 0 ? (
                <p className="mt-3 text-[13px] text-[#6b7280]">Đơn hàng chưa có lịch sử cập nhật thêm.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {order.timeline.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#edf0f4] p-3">
                      <p className="text-[13px] font-semibold text-[#263142]">{item.toStatusLabel}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">{formatDateTime(item.createdAt)}</p>
                      {item.note ? <p className="mt-1 text-[12px] text-[#4f5968]">{item.note}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
