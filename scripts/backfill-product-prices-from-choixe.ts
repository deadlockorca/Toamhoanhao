import path from "node:path";
import process from "node:process";
import { readFile, stat } from "node:fs/promises";

import { prisma } from "../src/lib/prisma";

type CliOptions = {
  sourceBaseUrl: string;
  dryRun: boolean;
  onlyEmpty: boolean;
  limitLocal: number | null;
  limitRemote: number | null;
  concurrency: number;
  timeoutMs: number;
};

type RemoteProduct = {
  handle: string;
  title: string;
  price: number;
  originalPrice: number | null;
};

type MatchResult = {
  remote: RemoteProduct | null;
  reason: "handle" | "title" | "ambiguous-title" | "not-found";
};

type Summary = {
  remoteSitemaps: number;
  remoteHandles: number;
  remoteProductsFetched: number;
  localProductsScanned: number;
  localProductsEligible: number;
  matchedByHandle: number;
  matchedByTitle: number;
  ambiguousTitle: number;
  unmatched: number;
  updated: number;
  unchanged: number;
  failedUpdates: number;
};

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) {
    return null;
  }

  const key = match[1];
  let value = match[2] ?? "";

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  value = value.replace(/\\n/g, "\n");
  return { key, value };
};

const loadEnvFiles = async () => {
  const projectRoot = process.cwd();
  const protectedKeys = new Set(Object.keys(process.env));

  const applyFile = async (fileName: string, allowOverrideFromLoadedFiles: boolean) => {
    const absolutePath = path.join(projectRoot, fileName);
    const fileStat = await stat(absolutePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      return;
    }

    const content = await readFile(absolutePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      const alreadyDefinedOutside = protectedKeys.has(parsed.key);
      const alreadyDefined = typeof process.env[parsed.key] === "string";

      if (alreadyDefinedOutside) {
        continue;
      }

      if (!alreadyDefined || allowOverrideFromLoadedFiles) {
        process.env[parsed.key] = parsed.value;
      }
    }
  };

  await applyFile(".env", false);
  await applyFile(".env.local", true);
};

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (value: string): string => {
  const base = value
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "san-pham";
};

const parsePositiveInt = (value: string, flag: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} phải là số nguyên dương.`);
  }
  return Math.floor(parsed);
};

const printUsage = () => {
  console.log(`
Backfill giá sản phẩm từ choixe.vn vào DB local.

Ví dụ:
  npm run prices:backfill -- --dry-run
  npm run prices:backfill -- --apply --only-empty
  npm run prices:backfill -- --apply --limit-local 200 --concurrency 12

Tùy chọn:
  --source <url>         Nguồn web (mặc định: https://choixe.vn)
  --dry-run              Chỉ mô phỏng, không ghi DB (mặc định)
  --apply                Thực thi cập nhật vào DB
  --only-empty           Chỉ cập nhật sản phẩm có price<=0 và originalPrice null (mặc định)
  --include-filled       Cập nhật cả sản phẩm đã có giá
  --limit-local <n>      Giới hạn số sản phẩm local đem đi match
  --limit-remote <n>     Giới hạn số handle remote để test nhanh
  --concurrency <n>      Số request đồng thời khi fetch remote (mặc định: 10)
  --timeout-ms <n>       Timeout mỗi request (mặc định: 15000)
  --help                 Hiển thị hướng dẫn
`);
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  let sourceBaseUrl = "https://choixe.vn";
  let dryRun = true;
  let onlyEmpty = true;
  let limitLocal: number | null = null;
  let limitRemote: number | null = null;
  let concurrency = 10;
  let timeoutMs = 15000;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--apply") {
      dryRun = false;
      continue;
    }
    if (arg === "--only-empty") {
      onlyEmpty = true;
      continue;
    }
    if (arg === "--include-filled") {
      onlyEmpty = false;
      continue;
    }

    const next = args[index + 1];
    if (!next) {
      throw new Error(`Thiếu giá trị cho ${arg}`);
    }

    if (arg === "--source") {
      sourceBaseUrl = normalizeBaseUrl(next);
      index += 1;
      continue;
    }
    if (arg === "--limit-local") {
      limitLocal = parsePositiveInt(next, "--limit-local");
      index += 1;
      continue;
    }
    if (arg === "--limit-remote") {
      limitRemote = parsePositiveInt(next, "--limit-remote");
      index += 1;
      continue;
    }
    if (arg === "--concurrency") {
      concurrency = parsePositiveInt(next, "--concurrency");
      index += 1;
      continue;
    }
    if (arg === "--timeout-ms") {
      timeoutMs = parsePositiveInt(next, "--timeout-ms");
      index += 1;
      continue;
    }

    throw new Error(`Tham số không hợp lệ: ${arg}`);
  }

  return {
    sourceBaseUrl,
    dryRun,
    onlyEmpty,
    limitLocal,
    limitRemote,
    concurrency,
    timeoutMs,
  };
};

const parseLocEntries = (xml: string) => {
  const locations: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const loc = match[1]?.trim();
    if (loc) {
      locations.push(loc);
    }
  }

  // Fallback for r.jina.ai markdown output:
  // [https://example.com/file.xml](https://example.com/file.xml)
  if (locations.length === 0) {
    const markdownLinkRegex = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/gi;
    while ((match = markdownLinkRegex.exec(xml)) !== null) {
      const loc = match[1]?.trim();
      if (loc) {
        locations.push(loc);
      }
    }
  }

  return locations;
};

const buildJinaProxyUrl = (url: string) => {
  const parsed = new URL(url);
  return `https://r.jina.ai/http://${parsed.host}${parsed.pathname}${parsed.search}`;
};

const fetchTextOnce = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "toamhoanhao-backfill-price/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} tại ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchText = async (url: string, timeoutMs: number) => {
  const triedErrors: string[] = [];
  const urls = unique([buildJinaProxyUrl(url), url]);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const candidate of urls) {
    const isProxy = candidate.includes("r.jina.ai");
    const maxAttempts = isProxy ? 4 : 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await fetchTextOnce(candidate, timeoutMs);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        triedErrors.push(`${candidate} (attempt ${attempt}): ${message}`);
        if (isProxy && message.includes("HTTP 429") && attempt < maxAttempts) {
          await sleep(1200 * attempt);
        }
      }
    }
  }

  throw new Error(`fetch failed. Tried: ${triedErrors.join(" | ")}`);
};

const toVnd = (rawValue: unknown): number => {
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value / 100);
};

const extractJsonPayload = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
};

const fetchRemoteProduct = async (
  sourceBaseUrl: string,
  handle: string,
  timeoutMs: number
): Promise<RemoteProduct | null> => {
  const url = `${sourceBaseUrl}/products/${handle}.js`;
  try {
    const text = await fetchText(url, timeoutMs);
    const payload = extractJsonPayload(text);
    const parsed = JSON.parse(payload) as {
      handle?: string;
      title?: string;
      price?: number;
      compare_at_price?: number;
      variants?: Array<{ price?: number; compare_at_price?: number }>;
    };

    const remoteHandle = (parsed.handle || handle).trim();
    const title = (parsed.title || "").trim();

    const basePriceRaw =
      typeof parsed.price === "number"
        ? parsed.price
        : parsed.variants?.find((variant) => typeof variant.price === "number")?.price ?? 0;

    const baseOriginalRaw =
      typeof parsed.compare_at_price === "number"
        ? parsed.compare_at_price
        : parsed.variants?.find((variant) => typeof variant.compare_at_price === "number")?.compare_at_price ?? 0;

    const price = toVnd(basePriceRaw);
    const compareAt = toVnd(baseOriginalRaw);
    const originalPrice = compareAt > price ? compareAt : null;

    if (!remoteHandle) {
      return null;
    }

    return {
      handle: remoteHandle,
      title,
      price,
      originalPrice,
    };
  } catch {
    return null;
  }
};

const runPool = async <TItem, TResult>(
  items: TItem[],
  concurrency: number,
  worker: (item: TItem, index: number) => Promise<TResult>
): Promise<TResult[]> => {
  if (items.length === 0) {
    return [];
  }

  const size = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<TResult>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: size }, async () => {
    while (true) {
      const current = cursor;
      cursor += 1;
      if (current >= items.length) {
        return;
      }
      results[current] = await worker(items[current], current);
    }
  });

  await Promise.all(runners);
  return results;
};

const unique = (values: string[]) => Array.from(new Set(values.filter((item) => item.length > 0)));

const determineHandleCandidates = (product: {
  slug: string;
  name: string;
  categorySlug: string | null;
}) => {
  const candidates: string[] = [];

  const slug = product.slug.trim();
  if (slug) {
    candidates.push(slug);
  }

  const categorySlug = product.categorySlug?.trim() ?? "";
  if (categorySlug) {
    const prefix = `${categorySlug}-`;
    if (slug.startsWith(prefix) && slug.length > prefix.length) {
      candidates.push(slug.slice(prefix.length));
    }
  }

  const fromName = slugify(product.name);
  if (fromName) {
    candidates.push(fromName);
  }

  return unique(candidates);
};

const matchRemoteProduct = (
  product: {
    slug: string;
    name: string;
    categorySlug: string | null;
  },
  remoteByHandle: Map<string, RemoteProduct>,
  remoteByNormalizedTitle: Map<string, RemoteProduct[]>
): MatchResult => {
  const handleCandidates = determineHandleCandidates(product);
  for (const handle of handleCandidates) {
    const matched = remoteByHandle.get(handle);
    if (matched) {
      return {
        remote: matched,
        reason: "handle",
      };
    }
  }

  const normalizedTitle = normalizeText(product.name);
  if (!normalizedTitle) {
    return {
      remote: null,
      reason: "not-found",
    };
  }

  const titleMatches = remoteByNormalizedTitle.get(normalizedTitle) ?? [];
  if (titleMatches.length === 1) {
    return {
      remote: titleMatches[0],
      reason: "title",
    };
  }
  if (titleMatches.length > 1) {
    return {
      remote: null,
      reason: "ambiguous-title",
    };
  }

  return {
    remote: null,
    reason: "not-found",
  };
};

const run = async () => {
  await loadEnvFiles();
  const options = parseArgs();

  const summary: Summary = {
    remoteSitemaps: 0,
    remoteHandles: 0,
    remoteProductsFetched: 0,
    localProductsScanned: 0,
    localProductsEligible: 0,
    matchedByHandle: 0,
    matchedByTitle: 0,
    ambiguousTitle: 0,
    unmatched: 0,
    updated: 0,
    unchanged: 0,
    failedUpdates: 0,
  };

  console.log(
    `[price-backfill] Start ${options.dryRun ? "(dry-run)" : "(apply)"} | source=${options.sourceBaseUrl} | onlyEmpty=${options.onlyEmpty} | concurrency=${options.concurrency}`
  );

  const sitemapIndexUrl = `${options.sourceBaseUrl}/sitemap.xml`;
  const sitemapIndexText = await fetchText(sitemapIndexUrl, options.timeoutMs);
  const sitemapIndexLocs = parseLocEntries(sitemapIndexText);

  const productSitemapUrls = unique(
    sitemapIndexLocs.filter((loc) => /\/sitemap_products_\d+\.xml$/i.test(loc))
  );

  if (productSitemapUrls.length === 0) {
    throw new Error("Không tìm thấy sitemap sản phẩm từ sitemap.xml.");
  }

  summary.remoteSitemaps = productSitemapUrls.length;
  console.log(`[price-backfill] Found ${productSitemapUrls.length} product sitemap(s).`);

  const handleSet = new Set<string>();

  const sitemapXmlList = await runPool(productSitemapUrls, Math.min(options.concurrency, 6), async (url) => {
    try {
      return await fetchText(url, options.timeoutMs);
    } catch {
      return "";
    }
  });

  for (const sitemapXml of sitemapXmlList) {
    if (!sitemapXml) {
      continue;
    }

    const locs = parseLocEntries(sitemapXml);
    for (const loc of locs) {
      const match = loc.match(/\/products\/([^/?#]+)$/i);
      if (match && match[1]) {
        handleSet.add(match[1]);
      }
    }
  }

  const handles = Array.from(handleSet).sort().slice(0, options.limitRemote ?? undefined);
  summary.remoteHandles = handles.length;
  if (handles.length === 0) {
    throw new Error("Không đọc được handle sản phẩm nào từ sitemap.");
  }

  console.log(`[price-backfill] Fetching remote product JSON: ${handles.length} handle(s).`);

  const remoteProductsRaw = await runPool(handles, options.concurrency, async (handle, index) => {
    if ((index + 1) % 200 === 0) {
      console.log(`[price-backfill] ...remote progress ${index + 1}/${handles.length}`);
    }
    return await fetchRemoteProduct(options.sourceBaseUrl, handle, options.timeoutMs);
  });

  const remoteProducts = remoteProductsRaw.filter((item): item is RemoteProduct => item !== null);
  summary.remoteProductsFetched = remoteProducts.length;

  const remoteByHandle = new Map<string, RemoteProduct>();
  const remoteByNormalizedTitle = new Map<string, RemoteProduct[]>();

  for (const item of remoteProducts) {
    remoteByHandle.set(item.handle, item);

    const normalizedTitle = normalizeText(item.title);
    if (!normalizedTitle) {
      continue;
    }

    const bucket = remoteByNormalizedTitle.get(normalizedTitle) ?? [];
    bucket.push(item);
    remoteByNormalizedTitle.set(normalizedTitle, bucket);
  }

  const localProducts = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      originalPrice: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  summary.localProductsScanned = localProducts.length;

  const candidates = localProducts
    .filter((item) => {
      if (!options.onlyEmpty) {
        return true;
      }
      const hasPrice = item.price > 0;
      const hasOriginal = item.originalPrice !== null && item.originalPrice > 0;
      return !hasPrice && !hasOriginal;
    })
    .slice(0, options.limitLocal ?? undefined);

  summary.localProductsEligible = candidates.length;

  console.log(`[price-backfill] Local eligible products: ${candidates.length}.`);

  for (const [index, product] of candidates.entries()) {
    if ((index + 1) % 200 === 0) {
      console.log(`[price-backfill] ...local progress ${index + 1}/${candidates.length}`);
    }

    const match = matchRemoteProduct(
      {
        slug: product.slug,
        name: product.name,
        categorySlug: product.category?.slug ?? null,
      },
      remoteByHandle,
      remoteByNormalizedTitle
    );

    if (!match.remote) {
      if (match.reason === "ambiguous-title") {
        summary.ambiguousTitle += 1;
      } else {
        summary.unmatched += 1;
      }
      continue;
    }

    if (match.reason === "handle") {
      summary.matchedByHandle += 1;
    } else if (match.reason === "title") {
      summary.matchedByTitle += 1;
    }

    const nextPrice = match.remote.price;
    const nextOriginal = match.remote.originalPrice;

    const unchanged = product.price === nextPrice && (product.originalPrice ?? null) === (nextOriginal ?? null);
    if (unchanged) {
      summary.unchanged += 1;
      continue;
    }

    if (options.dryRun) {
      summary.updated += 1;
      continue;
    }

    try {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          price: nextPrice,
          originalPrice: nextOriginal,
        },
      });
      summary.updated += 1;
    } catch {
      summary.failedUpdates += 1;
    }
  }

  console.log("\n[price-backfill] Summary");
  console.log(`- Remote sitemaps: ${summary.remoteSitemaps}`);
  console.log(`- Remote handles: ${summary.remoteHandles}`);
  console.log(`- Remote products fetched: ${summary.remoteProductsFetched}`);
  console.log(`- Local products scanned: ${summary.localProductsScanned}`);
  console.log(`- Local eligible: ${summary.localProductsEligible}`);
  console.log(`- Matched by handle: ${summary.matchedByHandle}`);
  console.log(`- Matched by title: ${summary.matchedByTitle}`);
  console.log(`- Ambiguous title: ${summary.ambiguousTitle}`);
  console.log(`- Unmatched: ${summary.unmatched}`);
  console.log(`- Updated: ${summary.updated}`);
  console.log(`- Unchanged: ${summary.unchanged}`);
  console.log(`- Failed updates: ${summary.failedUpdates}`);
};

void run()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[price-backfill] ERROR: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
