export type LocalCartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  variantLabel?: string | null;
};

export type AddLocalCartItemInput = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  variantLabel?: string | null;
};

export const CART_STORAGE_KEY = "toamhoanhao_cart_v1";
export const CART_UPDATED_EVENT = "toamhoanhao-cart-updated";
export const MAX_CART_QUANTITY = 99;

const toSafeInteger = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return fallback;
};

const clampQuantity = (value: unknown, fallback = 1) => {
  const normalized = Math.max(1, toSafeInteger(value, fallback));
  return Math.min(MAX_CART_QUANTITY, normalized);
};

const normalizeCartItem = (value: unknown): LocalCartItem | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const key = typeof raw.key === "string" ? raw.key.trim() : "";
  const productId = typeof raw.productId === "string" ? raw.productId.trim() : "";
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!key || !productId || !slug || !name) {
    return null;
  }

  const image =
    typeof raw.image === "string" && raw.image.trim() ? raw.image.trim() : "/products/p1.jpg";

  const variantId = typeof raw.variantId === "string" && raw.variantId.trim() ? raw.variantId.trim() : null;
  const variantLabel =
    typeof raw.variantLabel === "string" && raw.variantLabel.trim() ? raw.variantLabel.trim() : null;

  const price = Math.max(0, toSafeInteger(raw.price, 0));
  const originalPriceRaw = toSafeInteger(raw.originalPrice, 0);
  const originalPrice = originalPriceRaw > 0 ? originalPriceRaw : null;

  return {
    key,
    productId,
    variantId,
    slug,
    name,
    image,
    price,
    originalPrice,
    quantity: clampQuantity(raw.quantity, 1),
    variantLabel,
  };
};

const dispatchCartUpdated = (items: LocalCartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: {
        totalQuantity,
      },
    }),
  );
};

export const readLocalCart = (): LocalCartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeCartItem).filter((item): item is LocalCartItem => Boolean(item));
  } catch {
    return [];
  }
};

export const writeLocalCart = (items: LocalCartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  dispatchCartUpdated(items);
};

export const getLocalCartCount = () => {
  const items = readLocalCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const addItemToLocalCart = (input: AddLocalCartItemInput): LocalCartItem[] => {
  const current = readLocalCart();
  const next = [...current];
  const quantity = clampQuantity(input.quantity, 1);
  const existingIndex = next.findIndex((item) => item.key === input.key);

  if (existingIndex >= 0) {
    const existing = next[existingIndex];
    next[existingIndex] = {
      ...existing,
      price: Math.max(0, input.price),
      originalPrice: input.originalPrice && input.originalPrice > 0 ? input.originalPrice : null,
      image: input.image || existing.image,
      variantLabel: input.variantLabel?.trim() || existing.variantLabel || null,
      quantity: Math.min(MAX_CART_QUANTITY, existing.quantity + quantity),
    };
  } else {
    next.push({
      key: input.key,
      productId: input.productId,
      variantId: input.variantId,
      slug: input.slug,
      name: input.name,
      image: input.image || "/products/p1.jpg",
      price: Math.max(0, input.price),
      originalPrice: input.originalPrice && input.originalPrice > 0 ? input.originalPrice : null,
      quantity,
      variantLabel: input.variantLabel?.trim() || null,
    });
  }

  writeLocalCart(next);
  return next;
};

export const updateLocalCartItemQuantity = (key: string, quantity: number): LocalCartItem[] => {
  const current = readLocalCart();
  const next = current
    .map((item) => {
      if (item.key !== key) {
        return item;
      }

      return {
        ...item,
        quantity: clampQuantity(quantity, item.quantity),
      };
    })
    .filter((item) => item.quantity > 0);

  writeLocalCart(next);
  return next;
};

export const removeLocalCartItem = (key: string): LocalCartItem[] => {
  const current = readLocalCart();
  const next = current.filter((item) => item.key !== key);
  writeLocalCart(next);
  return next;
};

export const clearLocalCart = () => {
  writeLocalCart([]);
};
