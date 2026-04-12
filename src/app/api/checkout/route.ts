import { ProductStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { parseCreateOrderInput } from "@/lib/admin-order";
import { AUTH_COOKIE_NAME, getSessionByToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_ITEM_LINES = 50;
const MAX_ITEM_QUANTITY = 99;

const formatDatePart = (value: number) => String(value).padStart(2, "0");

const createOrderNumberCandidate = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${formatDatePart(now.getMonth() + 1)}${formatDatePart(now.getDate())}`;
  const randomPart = Math.floor(Math.random() * 900000 + 100000);
  return `TAH-${datePart}-${randomPart}`;
};

const generateUniqueOrderNumber = async () => {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const candidate = createOrderNumberCandidate();
    const existing = await prisma.customerOrder.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Không thể tạo mã đơn hàng duy nhất. Vui lòng thử lại.");
};

const resolveSessionUserId = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await getSessionByToken(token);
  return session?.userId ?? null;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseCreateOrderInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.data.items.length > MAX_ITEM_LINES) {
      return NextResponse.json({ error: "Số dòng sản phẩm trong đơn đang vượt quá giới hạn cho phép." }, { status: 400 });
    }

    if (parsed.data.items.some((item) => item.quantity > MAX_ITEM_QUANTITY)) {
      return NextResponse.json({ error: "Số lượng mỗi sản phẩm không được vượt quá 99." }, { status: 400 });
    }

    const productIds = Array.from(new Set(parsed.data.items.map((item) => item.productId)));
    const variantIds = Array.from(
      new Set(parsed.data.items.map((item) => item.variantId).filter((value): value is string => Boolean(value))),
    );

    const [products, variants, userId] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          isPublished: true,
          status: ProductStatus.ACTIVE,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          originalPrice: true,
          inStock: true,
        },
      }),
      variantIds.length > 0
        ? prisma.productVariant.findMany({
            where: {
              id: {
                in: variantIds,
              },
              isActive: true,
            },
            select: {
              id: true,
              productId: true,
              name: true,
              option1: true,
              option2: true,
              option3: true,
              imageUrl: true,
              sku: true,
              price: true,
              originalPrice: true,
              inStock: true,
            },
          })
        : Promise.resolve([]),
      resolveSessionUserId(),
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

    if (productMap.size !== productIds.length) {
      return NextResponse.json({ error: "Có sản phẩm không còn tồn tại hoặc đã ngừng hiển thị." }, { status: 400 });
    }

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Có sản phẩm không hợp lệ trong đơn hàng." }, { status: 400 });
      }

      if (!product.inStock) {
        return NextResponse.json({ error: `Sản phẩm \"${product.name}\" hiện đang tạm hết hàng.` }, { status: 400 });
      }

      if (!item.variantId) {
        continue;
      }

      const variant = variantMap.get(item.variantId);
      if (!variant || variant.productId !== item.productId) {
        return NextResponse.json({ error: "Có biến thể sản phẩm không hợp lệ trong đơn hàng." }, { status: 400 });
      }

      if (!variant.inStock) {
        return NextResponse.json({ error: `Biến thể của \"${product.name}\" hiện đang tạm hết hàng.` }, { status: 400 });
      }
    }

    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.customerAddress.create({
        data: {
          userId,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          email: parsed.data.email,
          addressLine1: parsed.data.addressLine1,
          addressLine2: parsed.data.addressLine2,
          province: parsed.data.province,
          district: parsed.data.district,
          ward: parsed.data.ward,
        },
        select: { id: true },
      });

      const normalizedItems = parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error("Sản phẩm không hợp lệ khi tạo đơn hàng.");
        }

        const variant = item.variantId ? variantMap.get(item.variantId) : null;
        const optionParts = [variant?.option1, variant?.option2, variant?.option3]
          .map((value) => value?.trim() ?? "")
          .filter(Boolean);

        const unitPrice = item.unitPrice ?? variant?.price ?? product.price;

        return {
          productId: product.id,
          variantId: variant?.id ?? null,
          productName: product.name,
          sku: variant?.sku ?? null,
          optionSummary: optionParts.length > 0 ? optionParts.join(" / ") : variant?.name ?? null,
          imageUrl: variant?.imageUrl ?? product.imageUrl,
          quantity: item.quantity,
          unitPrice,
          originalPrice: variant?.originalPrice ?? product.originalPrice,
          lineTotal: unitPrice * item.quantity,
        };
      });

      const subtotal = normalizedItems.reduce((total, item) => total + item.lineTotal, 0);
      const shippingFee = Math.max(0, parsed.data.shippingFee);
      const grandTotal = subtotal + shippingFee;

      const created = await tx.customerOrder.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentStatus: "UNPAID",
          fulfillmentStatus: "PENDING",
          currency: "VND",
          subtotal,
          discountTotal: 0,
          shippingFee,
          taxTotal: 0,
          grandTotal,
          customerNote: parsed.data.customerNote,
          shippingAddressId: address.id,
          billingAddressId: address.id,
        },
        select: {
          id: true,
          orderNumber: true,
          grandTotal: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      });

      await tx.orderItem.createMany({
        data: normalizedItems.map((item) => ({
          orderId: created.id,
          ...item,
        })),
      });

      await tx.payment.create({
        data: {
          orderId: created.id,
          method: parsed.data.paymentMethod,
          status: "UNPAID",
          amount: grandTotal,
          currency: "VND",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: created.id,
          fromStatus: null,
          toStatus: "PENDING",
          note: "Đơn hàng được tạo từ trang thanh toán công khai.",
          changedByUserId: userId,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          grandTotal: order.grandTotal,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
