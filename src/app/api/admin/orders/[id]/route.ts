import { NextResponse } from "next/server";

import {
  adminOrderSelect,
  parseUpdateOrderInput,
  toAdminOrderResponse,
  type AdminOrderRow,
} from "@/lib/admin-order";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const parsed = parseUpdateOrderInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.customerOrder.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        shippingAddressId: true,
        paidAt: true,
        confirmedAt: true,
        canceledAt: true,
        completedAt: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    const statusChanged = parsed.data.status !== null && parsed.data.status !== existing.status;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const updated = await tx.customerOrder.update({
        where: { id },
        data: {
          ...(parsed.data.status ? { status: parsed.data.status } : {}),
          ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
          ...(parsed.data.fulfillmentStatus
            ? { fulfillmentStatus: parsed.data.fulfillmentStatus }
            : {}),
          ...(parsed.data.internalNote !== null ? { internalNote: parsed.data.internalNote } : {}),
          ...(parsed.data.status === "CONFIRMED" && !existing.confirmedAt
            ? { confirmedAt: now }
            : {}),
          ...(parsed.data.status === "CANCELED" && !existing.canceledAt ? { canceledAt: now } : {}),
          ...(parsed.data.status === "COMPLETED" && !existing.completedAt
            ? { completedAt: now }
            : {}),
          ...(parsed.data.paymentStatus === "PAID" && !existing.paidAt ? { paidAt: now } : {}),
        },
      });

      if (statusChanged && parsed.data.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: existing.status,
            toStatus: parsed.data.status,
            note: "Cập nhật trạng thái từ trang quản trị.",
          },
        });
      }

      const shouldSyncShipment =
        parsed.data.fulfillmentStatus !== null ||
        parsed.data.carrier !== null ||
        parsed.data.serviceLevel !== null ||
        parsed.data.trackingNumber !== null;

      if (shouldSyncShipment) {
        const shipment = await tx.shipment.findFirst({
          where: {
            orderId: id,
          },
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
          },
        });

        const shipmentData = {
          ...(parsed.data.fulfillmentStatus ? { status: parsed.data.fulfillmentStatus } : {}),
          ...(parsed.data.carrier !== null ? { carrier: parsed.data.carrier } : {}),
          ...(parsed.data.serviceLevel !== null ? { serviceLevel: parsed.data.serviceLevel } : {}),
          ...(parsed.data.trackingNumber !== null ? { trackingNumber: parsed.data.trackingNumber } : {}),
        };

        if (shipment) {
          await tx.shipment.update({
            where: { id: shipment.id },
            data: shipmentData,
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId: id,
              shippingAddressId: existing.shippingAddressId,
              status: parsed.data.fulfillmentStatus ?? existing.fulfillmentStatus,
              carrier: parsed.data.carrier,
              serviceLevel: parsed.data.serviceLevel,
              trackingNumber: parsed.data.trackingNumber,
            },
          });
        }
      }

      return tx.customerOrder.findUniqueOrThrow({
        where: { id: updated.id },
        select: adminOrderSelect,
      });
    });

    return NextResponse.json({
      order: toAdminOrderResponse(updatedOrder as AdminOrderRow),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
