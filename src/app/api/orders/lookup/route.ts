import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const normalizeOrderNumber = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
};

const normalizePhoneDigits = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("840")) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("84") && digits.length >= 10) {
    return `0${digits.slice(2)}`;
  }

  return digits;
};

const getPossiblePhoneDigits = (value: unknown) => {
  const normalized = normalizePhoneDigits(value);
  if (!normalized) {
    return [];
  }

  const candidates = new Set<string>();
  candidates.add(normalized);

  if (normalized.startsWith("0") && normalized.length > 1) {
    candidates.add(normalized.slice(1));
    candidates.add(`84${normalized.slice(1)}`);
  }

  if (normalized.startsWith("84") && normalized.length > 2) {
    candidates.add(`0${normalized.slice(2)}`);
  }

  if (normalized.length >= 9) {
    candidates.add(normalized.slice(-9));
  }

  return Array.from(candidates).filter(Boolean);
};

const isPhoneMatched = (inputPhone: unknown, targetPhone: unknown) => {
  const inputSet = new Set(getPossiblePhoneDigits(inputPhone));
  const targetSet = new Set(getPossiblePhoneDigits(targetPhone));

  if (inputSet.size === 0 || targetSet.size === 0) {
    return false;
  }

  for (const inputValue of inputSet) {
    if (targetSet.has(inputValue)) {
      return true;
    }
  }

  for (const inputValue of inputSet) {
    for (const targetValue of targetSet) {
      if (inputValue.length >= 9 && targetValue.length >= 9) {
        if (inputValue.slice(-9) === targetValue.slice(-9)) {
          return true;
        }
      }
    }
  }

  return false;
};

const ORDER_NOT_FOUND_MESSAGE = "Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn và số điện thoại.";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  AUTHORIZED: "Đã ủy quyền",
  PAID: "Đã thanh toán",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thanh toán lỗi",
  CANCELED: "Thanh toán đã hủy",
};

const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PACKING: "Đang đóng gói",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  RETURNED: "Đã trả hàng",
  CANCELED: "Đã hủy",
};

const getStatusLabel = (value: string, dictionary: Record<string, string>) => dictionary[value] ?? value;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const orderNumber = normalizeOrderNumber(payload.orderNumber);
    const phone = normalizePhoneDigits(payload.phone);

    if (!orderNumber) {
      return NextResponse.json({ error: "Vui lòng nhập mã đơn hàng." }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: "Vui lòng nhập số điện thoại." }, { status: 400 });
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        orderNumber,
      },
      select: {
        id: true,
        orderNumber: true,
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
        createdAt: true,
        updatedAt: true,
        shippingAddress: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            addressLine1: true,
            addressLine2: true,
            ward: true,
            district: true,
            province: true,
          },
        },
        user: {
          select: {
            fullName: true,
            phone: true,
          },
        },
        items: {
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
            productName: true,
            optionSummary: true,
            quantity: true,
            unitPrice: true,
            originalPrice: true,
            lineTotal: true,
            imageUrl: true,
          },
        },
        statusHistories: {
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: ORDER_NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const targetPhone = order.shippingAddress?.phone || order.user?.phone;
    if (!isPhoneMatched(phone, targetPhone)) {
      return NextResponse.json({ error: ORDER_NOT_FOUND_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: getStatusLabel(order.status, STATUS_LABELS),
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: getStatusLabel(order.paymentStatus, PAYMENT_STATUS_LABELS),
        fulfillmentStatus: order.fulfillmentStatus,
        fulfillmentStatusLabel: getStatusLabel(order.fulfillmentStatus, FULFILLMENT_STATUS_LABELS),
        currency: order.currency,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        shippingFee: order.shippingFee,
        taxTotal: order.taxTotal,
        grandTotal: order.grandTotal,
        customerNote: order.customerNote,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        customer: {
          fullName: order.shippingAddress?.fullName || order.user?.fullName || null,
          phone: order.shippingAddress?.phone || order.user?.phone || null,
          email: order.shippingAddress?.email || null,
          addressLine1: order.shippingAddress?.addressLine1 || null,
          addressLine2: order.shippingAddress?.addressLine2 || null,
          ward: order.shippingAddress?.ward || null,
          district: order.shippingAddress?.district || null,
          province: order.shippingAddress?.province || null,
        },
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          optionSummary: item.optionSummary,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          originalPrice: item.originalPrice,
          lineTotal: item.lineTotal,
          imageUrl: item.imageUrl,
        })),
        timeline: order.statusHistories.map((history) => ({
          id: history.id,
          fromStatus: history.fromStatus,
          toStatus: history.toStatus,
          toStatusLabel: getStatusLabel(history.toStatus, STATUS_LABELS),
          note: history.note,
          createdAt: history.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tra cứu đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
