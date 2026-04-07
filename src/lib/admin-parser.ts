const BOOLEAN_TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const BOOLEAN_FALSE_VALUES = new Set(["false", "0", "no", "off"]);

export const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

export const toCleanString = (value: unknown, maxLength = 255): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
};

export const toInteger = (value: unknown): number | null => {
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

export const toBoolean = (value: unknown, fallback: boolean): boolean => {
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

export const toStringArray = (value: unknown, maxItemLength = 191): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toCleanString(item, maxItemLength))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => Boolean(item))
      .map((item) => item.slice(0, maxItemLength));
  }

  return [];
};

