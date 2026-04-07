"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
};

type AdminOrderItem = {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  productSlug: string | null;
  sku: string | null;
  optionSummary: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
  customerNote: string | null;
  internalNote: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  canceledAt: string | null;
  completedAt: string | null;
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
  items: AdminOrderItem[];
  payments: Array<{
    id: string;
    provider: string | null;
    method: string;
    status: string;
    amount: number;
    transactionId: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  shipments: Array<{
    id: string;
    status: string;
    carrier: string | null;
    serviceLevel: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
  }>;
};

type AdminOrderResponse = {
  orders?: AdminOrder[];
  products?: AdminProduct[];
  error?: string;
};

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED"
  | "FAILED";

type PaymentStatus =
  | "UNPAID"
  | "AUTHORIZED"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED"
  | "CANCELED";

type FulfillmentStatus =
  | "PENDING"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELED";

type OrderEditState = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  internalNote: string;
  carrier: string;
  serviceLevel: string;
  trackingNumber: string;
};

type CreateOrderFormState = {
  fullName: string;
  phone: string;
  addressLine1: string;
  email: string;
  productId: string;
  quantity: string;
  shippingFee: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "CARD" | "WALLET" | "OTHER";
  customerNote: string;
};

const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Hoàn tiền" },
  { value: "FAILED", label: "Thất bại" },
];

const paymentStatusOptions: Array<{ value: PaymentStatus; label: string }> = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "AUTHORIZED", label: "Đã xác thực" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "PARTIALLY_REFUNDED", label: "Hoàn tiền 1 phần" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "FAILED", label: "Thanh toán lỗi" },
  { value: "CANCELED", label: "Đã hủy thanh toán" },
];

const fulfillmentStatusOptions: Array<{ value: FulfillmentStatus; label: string }> = [
  { value: "PENDING", label: "Chờ xử lý kho" },
  { value: "PACKING", label: "Đang đóng gói" },
  { value: "SHIPPED", label: "Đã gửi hàng" },
  { value: "DELIVERED", label: "Đã giao thành công" },
  { value: "RETURNED", label: "Đã hoàn hàng" },
  { value: "CANCELED", label: "Đã hủy giao" },
];

const emptyCreateOrderForm: CreateOrderFormState = {
  fullName: "",
  phone: "",
  addressLine1: "",
  email: "",
  productId: "",
  quantity: "1",
  shippingFee: "0",
  paymentMethod: "COD",
  customerNote: "",
};

const parseErrorMessage = (responseBody: unknown, fallback: string) => {
  if (!responseBody || typeof responseBody !== "object" || Array.isArray(responseBody)) {
    return fallback;
  }

  const body = responseBody as { error?: unknown };
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }

  return fallback;
};

const toOrderEditState = (order: AdminOrder): OrderEditState => {
  const firstShipment = order.shipments[0];

  return {
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    internalNote: order.internalNote ?? "",
    carrier: firstShipment?.carrier ?? "",
    serviceLevel: firstShipment?.serviceLevel ?? "",
    trackingNumber: firstShipment?.trackingNumber ?? "",
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orderEdits, setOrderEdits] = useState<Record<string, OrderEditState>>({});
  const [createForm, setCreateForm] = useState<CreateOrderFormState>(emptyCreateOrderForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminOrderResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu đơn hàng."));
      }

      const nextOrders = Array.isArray(payload.orders) ? payload.orders : [];
      setOrders(nextOrders);
      setProducts(Array.isArray(payload.products) ? payload.products : []);

      const nextEdits: Record<string, OrderEditState> = {};
      nextOrders.forEach((order) => {
        nextEdits[order.id] = toOrderEditState(order);
      });
      setOrderEdits(nextEdits);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải dữ liệu đơn hàng.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: createForm.fullName,
          phone: createForm.phone,
          email: createForm.email,
          addressLine1: createForm.addressLine1,
          shippingFee: createForm.shippingFee,
          paymentMethod: createForm.paymentMethod,
          customerNote: createForm.customerNote,
          items: [
            {
              productId: createForm.productId,
              quantity: createForm.quantity,
            },
          ],
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tạo đơn hàng."));
      }

      setSuccessMessage("Đã tạo đơn hàng mới.");
      setCreateForm(emptyCreateOrderForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateOrder = async (order: AdminOrder) => {
    const edit = orderEdits[order.id];
    if (!edit) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingOrderId(order.id);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(edit),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể cập nhật đơn hàng."));
      }

      setSuccessMessage(`Đã cập nhật đơn ${order.orderNumber}.`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật đơn hàng.";
      setErrorMessage(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">Quản lý đơn hàng</h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Theo dõi đơn hàng, cập nhật trạng thái xử lý/thanh toán/giao hàng và tạo nhanh đơn test từ
            trang quản trị.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">Tạo nhanh đơn hàng</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreateOrder}>
            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Họ tên *</span>
              <input
                required
                value={createForm.fullName}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Nguyễn Văn A"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Số điện thoại *</span>
              <input
                required
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="0903xxxxxx"
              />
            </label>

            <label className="space-y-1 md:col-span-2 xl:col-span-2">
              <span className="text-[13px] font-medium text-[#363c47]">Địa chỉ giao hàng *</span>
              <input
                required
                value={createForm.addressLine1}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, addressLine1: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Số nhà, đường, phường/xã..."
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Email</span>
              <input
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="khachhang@email.com"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Sản phẩm *</span>
              <select
                required
                value={createForm.productId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, productId: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Số lượng *</span>
              <input
                required
                inputMode="numeric"
                value={createForm.quantity}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="1"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Phí vận chuyển</span>
              <input
                inputMode="numeric"
                value={createForm.shippingFee}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, shippingFee: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="0"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Phương thức thanh toán</span>
              <select
                value={createForm.paymentMethod}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value as CreateOrderFormState["paymentMethod"],
                  }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="COD">COD</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
                <option value="WALLET">Ví điện tử</option>
                <option value="OTHER">Khác</option>
              </select>
            </label>

            <label className="space-y-1 md:col-span-2 xl:col-span-4">
              <span className="text-[13px] font-medium text-[#363c47]">Ghi chú khách hàng</span>
              <textarea
                rows={2}
                value={createForm.customerNote}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, customerNote: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Ví dụ: gọi trước khi giao..."
              />
            </label>

            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-[#1f2329] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#323843] disabled:cursor-not-allowed disabled:bg-[#9199a8]"
              >
                {isCreating ? "Đang tạo đơn..." : "Tạo đơn hàng"}
              </button>
            </div>
          </form>

          {errorMessage && (
            <p className="mt-4 rounded-xl border border-[#f0a7a7] bg-[#fff0f0] px-3 py-2 text-[14px] text-[#b11f1f]">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-4 rounded-xl border border-[#b8e4c3] bg-[#f0fff5] px-3 py-2 text-[14px] text-[#1e7b3f]">
              {successMessage}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách đơn hàng</h2>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                void loadData();
              }}
              className="rounded-xl border border-[#cfd3da] px-4 py-2 text-[14px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
            >
              Tải lại dữ liệu
            </button>
          </div>

          {isLoading ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách đơn hàng...</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có đơn hàng nào trong database.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[1400px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Đơn hàng</th>
                    <th className="px-3 py-2.5 font-semibold">Khách hàng</th>
                    <th className="px-3 py-2.5 font-semibold">Giá trị</th>
                    <th className="px-3 py-2.5 font-semibold">Sản phẩm</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Giao hàng</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const edit = orderEdits[order.id] ?? toOrderEditState(order);

                    return (
                      <tr key={order.id} className="border-t border-[#ececf1] align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-[#1f2329]">{order.orderNumber}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <p className="font-medium">{order.customer.fullName ?? "Khách lẻ"}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            {order.customer.phone ?? "Chưa có số điện thoại"}
                          </p>
                          {order.customer.addressLine1 && (
                            <p className="mt-1 text-[12px] text-[#6a7280]">{order.customer.addressLine1}</p>
                          )}
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <p className="font-semibold">{currencyFormatter.format(order.grandTotal)}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            Tạm tính: {currencyFormatter.format(order.subtotal)}
                          </p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            Ship: {currencyFormatter.format(order.shippingFee)}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item) => (
                              <p key={item.id} className="text-[12px] text-[#4b5361]">
                                {item.productName} x{item.quantity}
                              </p>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-[12px] text-[#6a7280]">+{order.items.length - 3} sản phẩm khác</p>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <div className="space-y-2">
                            <select
                              value={edit.status}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...edit,
                                    status: event.target.value as OrderStatus,
                                  },
                                }))
                              }
                              className="w-[180px] rounded-lg border border-[#cdd1d8] bg-white px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                            >
                              {orderStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <select
                              value={edit.paymentStatus}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...edit,
                                    paymentStatus: event.target.value as PaymentStatus,
                                  },
                                }))
                              }
                              className="w-[180px] rounded-lg border border-[#cdd1d8] bg-white px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                            >
                              {paymentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <select
                              value={edit.fulfillmentStatus}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...edit,
                                    fulfillmentStatus: event.target.value as FulfillmentStatus,
                                  },
                                }))
                              }
                              className="w-[180px] rounded-lg border border-[#cdd1d8] bg-white px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                            >
                              {fulfillmentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-2">
                            <input
                              value={edit.carrier}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: { ...edit, carrier: event.target.value },
                                }))
                              }
                              className="w-[210px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Đơn vị vận chuyển"
                            />
                            <input
                              value={edit.serviceLevel}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: { ...edit, serviceLevel: event.target.value },
                                }))
                              }
                              className="w-[210px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Gói vận chuyển"
                            />
                            <input
                              value={edit.trackingNumber}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: { ...edit, trackingNumber: event.target.value },
                                }))
                              }
                              className="w-[210px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Mã vận đơn"
                            />
                            <textarea
                              rows={2}
                              value={edit.internalNote}
                              onChange={(event) =>
                                setOrderEdits((prev) => ({
                                  ...prev,
                                  [order.id]: { ...edit, internalNote: event.target.value },
                                }))
                              }
                              className="w-[210px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Ghi chú nội bộ"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              void handleUpdateOrder(order);
                            }}
                            disabled={updatingOrderId === order.id}
                            className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingOrderId === order.id ? "Đang lưu..." : "Lưu"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

