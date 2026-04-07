import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  type PaymentMethod,
} from "@prisma/client";

import { toCleanString, toInteger, toRecord } from "@/lib/admin-parser";

export const adminOrderSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentStatus: true,
  fulfillmentStatus: true,
  currency: true,
  subtotal: true,
  discountTotal: true,
  shippingFee: true,
  taxTotal: true,
  grandTotal: true,
  customerNote: true,
  internalNote: true,
  paidAt: true,
  confirmedAt: true,
  canceledAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
    },
  },
  shippingAddress: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      province: true,
      district: true,
      ward: true,
      addressLine1: true,
      addressLine2: true,
    },
  },
  items: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      productId: true,
      variantId: true,
      productName: true,
      sku: true,
      optionSummary: true,
      imageUrl: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
      variant: {
        select: {
          name: true,
          option1: true,
          option2: true,
          option3: true,
        },
      },
    },
  },
  payments: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      provider: true,
      method: true,
      status: true,
      amount: true,
      transactionId: true,
      paidAt: true,
      createdAt: true,
    },
  },
  shipments: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      carrier: true,
      serviceLevel: true,
      trackingNumber: true,
      shippedAt: true,
      deliveredAt: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerOrderSelect;

export type AdminOrderRow = Prisma.CustomerOrderGetPayload<{
  select: typeof adminOrderSelect;
}>;

export const toAdminOrderResponse = (order: AdminOrderRow) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  userId: order.userId,
  status: order.status,
  paymentStatus: order.paymentStatus,
  fulfillmentStatus: order.fulfillmentStatus,
  currency: order.currency,
  subtotal: order.subtotal,
  discountTotal: order.discountTotal,
  shippingFee: order.shippingFee,
  taxTotal: order.taxTotal,
  grandTotal: order.grandTotal,
  customerNote: order.customerNote,
  internalNote: order.internalNote,
  paidAt: order.paidAt?.toISOString() ?? null,
  confirmedAt: order.confirmedAt?.toISOString() ?? null,
  canceledAt: order.canceledAt?.toISOString() ?? null,
  completedAt: order.completedAt?.toISOString() ?? null,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
  customer: {
    fullName: order.shippingAddress?.fullName ?? order.user?.fullName ?? null,
    phone: order.shippingAddress?.phone ?? order.user?.phone ?? null,
    email: order.shippingAddress?.email ?? order.user?.email ?? null,
    addressLine1: order.shippingAddress?.addressLine1 ?? null,
    addressLine2: order.shippingAddress?.addressLine2 ?? null,
    ward: order.shippingAddress?.ward ?? null,
    district: order.shippingAddress?.district ?? null,
    province: order.shippingAddress?.province ?? null,
  },
  items: order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    productSlug: item.product?.slug ?? null,
    sku: item.sku,
    optionSummary: item.optionSummary,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  })),
  payments: order.payments.map((payment) => ({
    id: payment.id,
    provider: payment.provider,
    method: payment.method,
    status: payment.status,
    amount: payment.amount,
    transactionId: payment.transactionId,
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
  })),
  shipments: order.shipments.map((shipment) => ({
    id: shipment.id,
    status: shipment.status,
    carrier: shipment.carrier,
    serviceLevel: shipment.serviceLevel,
    trackingNumber: shipment.trackingNumber,
    shippedAt: shipment.shippedAt?.toISOString() ?? null,
    deliveredAt: shipment.deliveredAt?.toISOString() ?? null,
    createdAt: shipment.createdAt.toISOString(),
  })),
});

type CreateOrderItemInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number | null;
};

export type CreateOrderInput = {
  fullName: string;
  phone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  customerNote: string | null;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemInput[];
};

const parsePaymentMethod = (value: unknown): PaymentMethod => {
  if (typeof value !== "string") {
    return "COD";
  }

  const cleaned = value.trim().toUpperCase();
  const allowed: PaymentMethod[] = ["COD", "BANK_TRANSFER", "CARD", "WALLET", "OTHER"];
  if (allowed.includes(cleaned as PaymentMethod)) {
    return cleaned as PaymentMethod;
  }

  return "COD";
};

export const parseCreateOrderInput = (
  input: unknown
): { ok: true; data: CreateOrderInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const fullName = toCleanString(payload.fullName, 191);
  if (!fullName) {
    return { ok: false, error: "Họ tên khách hàng là bắt buộc." };
  }

  const phone = toCleanString(payload.phone, 30);
  if (!phone) {
    return { ok: false, error: "Số điện thoại là bắt buộc." };
  }

  const addressLine1 = toCleanString(payload.addressLine1, 191);
  if (!addressLine1) {
    return { ok: false, error: "Địa chỉ giao hàng là bắt buộc." };
  }

  const itemsValue = payload.items;
  if (!Array.isArray(itemsValue) || itemsValue.length === 0) {
    return { ok: false, error: "Đơn hàng phải có ít nhất 1 sản phẩm." };
  }

  const items: CreateOrderItemInput[] = [];
  for (const itemValue of itemsValue) {
    const item = toRecord(itemValue);
    if (!item) {
      return { ok: false, error: "Dữ liệu sản phẩm trong đơn không hợp lệ." };
    }

    const productId = toCleanString(item.productId, 191);
    if (!productId) {
      return { ok: false, error: "Mỗi dòng sản phẩm phải có productId." };
    }

    const quantity = toInteger(item.quantity) ?? 1;
    if (quantity <= 0) {
      return { ok: false, error: "Số lượng sản phẩm phải lớn hơn 0." };
    }

    const unitPrice = toInteger(item.unitPrice);
    if (unitPrice !== null && unitPrice < 0) {
      return { ok: false, error: "Giá sản phẩm không hợp lệ." };
    }

    items.push({
      productId,
      variantId: toCleanString(item.variantId, 191),
      quantity,
      unitPrice,
    });
  }

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email: toCleanString(payload.email, 191),
      addressLine1,
      addressLine2: toCleanString(payload.addressLine2, 191),
      province: toCleanString(payload.province, 191),
      district: toCleanString(payload.district, 191),
      ward: toCleanString(payload.ward, 191),
      customerNote: toCleanString(payload.customerNote, 800),
      shippingFee: Math.max(0, toInteger(payload.shippingFee) ?? 0),
      paymentMethod: parsePaymentMethod(payload.paymentMethod),
      items,
    },
  };
};

export type UpdateOrderInput = {
  status: OrderStatus | null;
  paymentStatus: PaymentStatus | null;
  fulfillmentStatus: FulfillmentStatus | null;
  internalNote: string | null;
  carrier: string | null;
  serviceLevel: string | null;
  trackingNumber: string | null;
};

const parseEnum = <T extends string>(value: unknown, allowedValues: readonly T[]): T | null => {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim().toUpperCase();
  if (allowedValues.includes(cleaned as T)) {
    return cleaned as T;
  }

  return null;
};

export const parseUpdateOrderInput = (
  input: unknown
): { ok: true; data: UpdateOrderInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const status = parseEnum(payload.status, Object.values(OrderStatus));
  if (payload.status !== undefined && status === null) {
    return { ok: false, error: "Trạng thái đơn hàng không hợp lệ." };
  }

  const paymentStatus = parseEnum(payload.paymentStatus, Object.values(PaymentStatus));
  if (payload.paymentStatus !== undefined && paymentStatus === null) {
    return { ok: false, error: "Trạng thái thanh toán không hợp lệ." };
  }

  const fulfillmentStatus = parseEnum(payload.fulfillmentStatus, Object.values(FulfillmentStatus));
  if (payload.fulfillmentStatus !== undefined && fulfillmentStatus === null) {
    return { ok: false, error: "Trạng thái giao hàng không hợp lệ." };
  }

  return {
    ok: true,
    data: {
      status,
      paymentStatus,
      fulfillmentStatus,
      internalNote: toCleanString(payload.internalNote, 1000),
      carrier: toCleanString(payload.carrier, 191),
      serviceLevel: toCleanString(payload.serviceLevel, 191),
      trackingNumber: toCleanString(payload.trackingNumber, 191),
    },
  };
};

