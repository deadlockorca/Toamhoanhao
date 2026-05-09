const DEFAULT_SITE_URL = "https://toamhoanhao.net";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const createSiteUrlObject = () => {
  try {
    return new URL(SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
};

export const toAbsoluteUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!path.startsWith("/")) {
    return `${SITE_URL}/${path}`;
  }

  return `${SITE_URL}${path}`;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

export const createBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path),
  })),
});
