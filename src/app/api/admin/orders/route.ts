import { NextResponse } from "next/server";

import {
  adminOrderSelect,
  parseCreateOrderInput,
  toAdminOrderResponse,
  type AdminOrderRow,
} from "@/lib/admin-order";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_ORDER_LIMIT = 100;
const MAX_ORDER_LIMIT = 200;
const DEFAULT_PRODUCT_LIMIT = 150;
const MAX_PRODUCT_LIMIT = 300;

const formatDatePart = (value: number) => String(value).padStart(2, "0");

const parsePositiveInt = (raw: string | null, fallback: number, max: number) => {
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(value), max);
};

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderLimit = parsePositiveInt(url.searchParams.get("orderLimit"), DEFAULT_ORDER_LIMIT, MAX_ORDER_LIMIT);
    const productLimit = parsePositiveInt(
      url.searchParams.get("productLimit"),
      DEFAULT_PRODUCT_LIMIT,
      MAX_PRODUCT_LIMIT,
    );

    const [orders, products] = await Promise.all([
      prisma.customerOrder.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: orderLimit,
        select: adminOrderSelect,
      }),
      prisma.product.findMany({
        orderBy: [{ name: "asc" }],
        take: productLimit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      }),
    ]);

    return NextResponse.json({
      orders: (orders as AdminOrderRow[]).map(toAdminOrderResponse),
      products,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải dữ liệu đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseCreateOrderInput(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const productIds = Array.from(new Set(parsed.data.items.map((item) => item.productId)));
    const variantIds = Array.from(
      new Set(parsed.data.items.map((item) => item.variantId).filter((value): value is string => Boolean(value)))
    );

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      }),
      variantIds.length > 0
        ? prisma.productVariant.findMany({
            where: {
              id: {
                in: variantIds,
              },
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
            },
          })
        : Promise.resolve([]),
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

    if (productMap.size !== productIds.length) {
      return NextResponse.json({ error: "Có sản phẩm không tồn tại trong đơn hàng." }, { status: 400 });
    }

    for (const item of parsed.data.items) {
      if (!item.variantId) {
        continue;
      }

      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json({ error: "Có biến thể không tồn tại trong đơn hàng." }, { status: 400 });
      }

      if (variant.productId !== item.productId) {
        return NextResponse.json(
          { error: "Biến thể không thuộc đúng sản phẩm trong đơn hàng." },
          { status: 400 }
        );
      }
    }

    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.customerAddress.create({
        data: {
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
        const optionParts = [variant?.option1, variant?.option2, variant?.option3].filter(
          (value): value is string => Boolean(value)
        );

        const unitPrice = item.unitPrice ?? variant?.price ?? product.price;
        const lineTotal = unitPrice * item.quantity;

        return {
          productId: product.id,
          variantId: variant?.id ?? null,
          productName: product.name,
          sku: variant?.sku ?? null,
          optionSummary: optionParts.length > 0 ? optionParts.join(" / ") : variant?.name ?? null,
          imageUrl: variant?.imageUrl ?? product.imageUrl,
          quantity: item.quantity,
          unitPrice,
          originalPrice: null,
          lineTotal,
        };
      });

      const subtotal = normalizedItems.reduce((total, item) => total + item.lineTotal, 0);
      const grandTotal = subtotal + parsed.data.shippingFee;

      const created = await tx.customerOrder.create({
        data: {
          orderNumber,
          status: "PENDING",
          paymentStatus: "UNPAID",
          fulfillmentStatus: "PENDING",
          currency: "VND",
          subtotal,
          discountTotal: 0,
          shippingFee: parsed.data.shippingFee,
          taxTotal: 0,
          grandTotal,
          customerNote: parsed.data.customerNote,
          shippingAddressId: address.id,
          billingAddressId: address.id,
        },
        select: {
          id: true,
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
          note: "Đơn hàng được tạo từ trang quản trị.",
        },
      });

      return tx.customerOrder.findUniqueOrThrow({
        where: { id: created.id },
        select: adminOrderSelect,
      });
    });

    return NextResponse.json({ order: toAdminOrderResponse(order as AdminOrderRow) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
