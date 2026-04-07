import { ProductTab } from "@prisma/client";

const BOOLEAN_TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const BOOLEAN_FALSE_VALUES = new Set(["false", "0", "no", "off"]);

export type ProductInput = {
  name: string;
  slugInput: string;
  imageUrl: string | null;
  imageUrls: string[];
  shortDescription: string | null;
  description: string | null;
  specs: ProductSpecInput[];
  showContactPrice: boolean;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  tab: ProductTab;
  inStock: boolean;
  isFeatured: boolean;
  categoryId: string | null;
};

export type ProductSpecInput = {
  name: string;
  value: string;
  sortOrder: number;
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toCleanString = (value: unknown, maxLength = 255): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
};

const toCleanMultilineString = (value: unknown, maxLength = 2000): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    const normalized = value.replace(/\r/g, "\n");
    return normalized
      .split("\n")
      .flatMap((line) => line.split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const cleaned = value.trim();
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned.replace(/,/g, ""));
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return null;
};

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.trim().toLowerCase();

    if (BOOLEAN_TRUE_VALUES.has(cleaned)) {
      return true;
    }

    if (BOOLEAN_FALSE_VALUES.has(cleaned)) {
      return false;
    }
  }

  return fallback;
};

const toTab = (value: unknown): ProductTab => {
  if (typeof value === "string") {
    const cleaned = value.trim().toUpperCase();

    if (cleaned === ProductTab.NEW || cleaned === ProductTab.BEST || cleaned === ProductTab.SALE) {
      return cleaned as ProductTab;
    }
  }

  return ProductTab.NEW;
};

const toSpecs = (value: unknown): { ok: true; data: ProductSpecInput[] } | { ok: false; error: string } => {
  if (value == null) {
    return { ok: true, data: [] };
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: "Thông số sản phẩm không hợp lệ." };
  }

  const parsedSpecs: ProductSpecInput[] = [];

  for (const [index, item] of value.entries()) {
    const row = toRecord(item);
    if (!row) {
      return { ok: false, error: `Thông số sản phẩm dòng ${index + 1} không hợp lệ.` };
    }

    const name = toCleanString(row.name, 180) ?? "";
    const specValue = toCleanMultilineString(row.value, 2000) ?? "";

    if (!name && !specValue) {
      continue;
    }

    if (!name || !specValue) {
      return { ok: false, error: `Thông số sản phẩm dòng ${index + 1} cần đủ tên và giá trị.` };
    }

    parsedSpecs.push({
      name,
      value: specValue,
      sortOrder: parsedSpecs.length,
    });

    if (parsedSpecs.length > 30) {
      return { ok: false, error: "Tối đa 30 thông số sản phẩm." };
    }
  }

  return { ok: true, data: parsedSpecs };
};

export const slugify = (value: string): string => {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (base || "san-pham").slice(0, 80);
};

export const parseProductInput = (input: unknown):
  | { ok: true; data: ProductInput }
  | { ok: false; error: string } => {
  const payload = toRecord(input);

  if (!payload) {
    return { ok: false, error: "Payload không hợp lệ." };
  }

  const name = toCleanString(payload.name, 180);
  if (!name) {
    return { ok: false, error: "Tên sản phẩm là bắt buộc." };
  }

  const showContactPrice = toBoolean(payload.showContactPrice, false);

  const parsedPrice = toNumber(payload.price);
  const parsedOriginalPrice = toNumber(payload.originalPrice);

  if (!showContactPrice && (parsedPrice === null || parsedPrice < 0)) {
    return { ok: false, error: "Giá bán không hợp lệ." };
  }

  if (parsedOriginalPrice !== null && parsedOriginalPrice < 0) {
    return { ok: false, error: "Giá gốc không hợp lệ." };
  }

  const price = showContactPrice ? 0 : (parsedPrice ?? 0);
  const originalPrice = showContactPrice ? null : parsedOriginalPrice;

  const specsParsed = toSpecs(payload.specs);
  if (!specsParsed.ok) {
    return { ok: false, error: specsParsed.error };
  }

  const imageUrlInput = toCleanString(payload.imageUrl, 500);
  const imageUrlsFromPayload = toStringArray(payload.imageUrls)
    .map((url) => toCleanString(url, 500))
    .filter((url): url is string => Boolean(url));

  const mergedImageUrls: string[] = [];
  if (imageUrlInput) {
    mergedImageUrls.push(imageUrlInput);
  }
  for (const url of imageUrlsFromPayload) {
    if (!mergedImageUrls.includes(url)) {
      mergedImageUrls.push(url);
    }
  }

  if (mergedImageUrls.length > 5) {
    return { ok: false, error: "Mỗi sản phẩm tối đa 5 ảnh." };
  }

  const data: ProductInput = {
    name,
    slugInput: toCleanString(payload.slug, 120) ?? "",
    imageUrl: mergedImageUrls[0] ?? null,
    imageUrls: mergedImageUrls,
    shortDescription: toCleanMultilineString(payload.shortDescription, 191),
    description: toCleanMultilineString(payload.description, 2000),
    specs: specsParsed.data,
    showContactPrice,
    price,
    originalPrice,
    badge: toCleanString(payload.badge, 50),
    tab: toTab(payload.tab),
    inStock: toBoolean(payload.inStock, true),
    isFeatured: toBoolean(payload.isFeatured, false),
    categoryId: toCleanString(payload.categoryId, 100),
  };

  return { ok: true, data };
};
