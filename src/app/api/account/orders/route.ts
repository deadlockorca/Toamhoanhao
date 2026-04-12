import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getSessionByToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
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

const getLabel = (value: string, dictionary: Record<string, string>) => dictionary[value] ?? value;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
    }

    const orders = await prisma.customerOrder.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        grandTotal: true,
        customerNote: true,
        createdAt: true,
        items: {
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
            productName: true,
            optionSummary: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: getLabel(order.status, ORDER_STATUS_LABELS),
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: getLabel(order.paymentStatus, PAYMENT_STATUS_LABELS),
        fulfillmentStatus: order.fulfillmentStatus,
        fulfillmentStatusLabel: getLabel(order.fulfillmentStatus, FULFILLMENT_STATUS_LABELS),
        grandTotal: order.grandTotal,
        customerNote: order.customerNote,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          optionSummary: item.optionSummary,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải lịch sử đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
