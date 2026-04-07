import { Prisma } from "@prisma/client";

import { toBoolean, toCleanString, toInteger, toRecord } from "@/lib/admin-parser";

export const adminVariantSelect = {
  id: true,
  productId: true,
  name: true,
  sku: true,
  barcode: true,
  option1: true,
  option2: true,
  option3: true,
  imageUrl: true,
  price: true,
  originalPrice: true,
  stockQuantity: true,
  inStock: true,
  isDefault: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
    },
  },
} satisfies Prisma.ProductVariantSelect;

export type AdminVariantRow = Prisma.ProductVariantGetPayload<{
  select: typeof adminVariantSelect;
}>;

export const toAdminVariantResponse = (variant: AdminVariantRow) => ({
  id: variant.id,
  productId: variant.productId,
  productName: variant.product.name,
  productSlug: variant.product.slug,
  productPrice: variant.product.price,
  name: variant.name,
  sku: variant.sku,
  barcode: variant.barcode,
  option1: variant.option1,
  option2: variant.option2,
  option3: variant.option3,
  imageUrl: variant.imageUrl,
  price: variant.price,
  originalPrice: variant.originalPrice,
  stockQuantity: variant.stockQuantity,
  inStock: variant.inStock,
  isDefault: variant.isDefault,
  isActive: variant.isActive,
  sortOrder: variant.sortOrder,
  createdAt: variant.createdAt.toISOString(),
  updatedAt: variant.updatedAt.toISOString(),
});

export type VariantInput = {
  productId: string;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  inStock: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export const parseVariantInput = (
  input: unknown
): { ok: true; data: VariantInput } | { ok: false; error: string } => {
  const payload = toRecord(input);
  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const productId = toCleanString(payload.productId, 191);
  if (!productId) {
    return { ok: false, error: "Vui lòng chọn sản phẩm." };
  }

  const price = toInteger(payload.price);
  if (price === null || price < 0) {
    return { ok: false, error: "Giá biến thể không hợp lệ." };
  }

  const originalPrice = toInteger(payload.originalPrice);
  if (originalPrice !== null && originalPrice < 0) {
    return { ok: false, error: "Giá gốc biến thể không hợp lệ." };
  }

  const stockQuantity = toInteger(payload.stockQuantity) ?? 0;
  if (stockQuantity < 0) {
    return { ok: false, error: "Tồn kho phải lớn hơn hoặc bằng 0." };
  }

  const inStockFallback = stockQuantity > 0;

  return {
    ok: true,
    data: {
      productId,
      name: toCleanString(payload.name, 191),
      sku: toCleanString(payload.sku, 191),
      barcode: toCleanString(payload.barcode, 191),
      option1: toCleanString(payload.option1, 191),
      option2: toCleanString(payload.option2, 191),
      option3: toCleanString(payload.option3, 191),
      imageUrl: toCleanString(payload.imageUrl, 500),
      price,
      originalPrice,
      stockQuantity,
      inStock: toBoolean(payload.inStock, inStockFallback),
      isDefault: toBoolean(payload.isDefault, false),
      isActive: toBoolean(payload.isActive, true),
      sortOrder: toInteger(payload.sortOrder) ?? 0,
    },
  };
};

export const variantOptionSummary = (variant: {
  option1: string | null;
  option2: string | null;
  option3: string | null;
  name: string | null;
}) => {
  const optionParts = [variant.option1, variant.option2, variant.option3].filter(
    (value): value is string => Boolean(value)
  );

  if (optionParts.length > 0) {
    return optionParts.join(" / ");
  }

  return variant.name ?? "Biến thể mặc định";
};

