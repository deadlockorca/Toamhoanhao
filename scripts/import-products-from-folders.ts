import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type ProductTab = "NEW" | "BEST" | "SALE";

type CliOptions = {
  rootDir: string;
  dryRun: boolean;
  limit: number | null;
  maxImages: number;
  defaultPrice: number;
  defaultTab: ProductTab;
  createMissingCategories: boolean;
};

const PRODUCT_STATUS_ACTIVE = "ACTIVE" as const;

const slugify = (value: string): string => {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (base || "san-pham").slice(0, 80);
};

type CategoryRecord = {
  id: string;
  slug: string;
  name: string;
  isDryRun?: boolean;
};

type ExistingProductRecord = {
  slug: string;
  name: string;
  categoryId: string | null;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint: string;
  publicBaseUrl: string;
};

type Summary = {
  categoryFolders: number;
  matchedCategories: number;
  createdCategories: number;
  missingCategories: number;
  productFolders: number;
  createdProducts: number;
  updatedProducts: number;
  skippedNoImage: number;
  uploadedImages: number;
  failedProducts: number;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

const collator = new Intl.Collator("vi", {
  numeric: true,
  sensitivity: "base",
});

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

const printUsage = () => {
  console.log(`
Import sản phẩm từ cấu trúc thư mục:
  <root>/<danh-muc>/<ten-san-pham>/<anh1.jpg|png|...>

Ví dụ:
  npm run import:folders -- --root "/Users/bowthoois/Desktop/du-lieu-san-pham" --default-price 1999000

Tuỳ chọn:
  --root <path>              Đường dẫn thư mục gốc (bắt buộc)
  --dry-run                  Chỉ mô phỏng, không ghi DB và không upload R2
  --limit <n>                Giới hạn số thư mục sản phẩm để test nhanh
  --max-images <n>           Số ảnh tối đa mỗi sản phẩm (mặc định: 5)
  --default-price <n>        Giá mặc định cho sản phẩm mới (mặc định: 0)
  --default-tab <NEW|BEST|SALE>  Tab mặc định cho sản phẩm mới (mặc định: NEW)
  --create-categories        Tự tạo danh mục nếu chưa có trong DB
  --help                     Hiển thị hướng dẫn
`);
};

const parsePositiveInt = (value: string, flag: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} phải là số nguyên dương.`);
  }
  return Math.floor(parsed);
};

const parseNonNegativeInt = (value: string, flag: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${flag} phải là số nguyên không âm.`);
  }
  return Math.floor(parsed);
};

const normalizeForCompare = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizePublicBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const sanitizeFileName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const contentTypeFromExt = (ext: string) => {
  const lower = ext.toLowerCase();
  if (lower === ".jpg" || lower === ".jpeg") return "image/jpeg";
  if (lower === ".png") return "image/png";
  if (lower === ".webp") return "image/webp";
  if (lower === ".gif") return "image/gif";
  if (lower === ".avif") return "image/avif";
  if (lower === ".svg") return "image/svg+xml";
  return "application/octet-stream";
};

const trimSlug = (value: string, maxLength = 120) => value.replace(/^-+|-+$/g, "").slice(0, maxLength);

const getStableSlug = (categorySlug: string, productFolderName: string, relativeProductPath: string) => {
  const baseSlug = trimSlug(`${categorySlug}-${slugify(productFolderName)}`);
  const digest = createHash("sha1").update(relativeProductPath).digest("hex").slice(0, 6);
  return trimSlug(`${baseSlug}-${digest}`);
};

const toDisplayName = (folderName: string) => folderName.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

const listDirectories = async (dirPath: string) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  let rootDir = "";
  let dryRun = false;
  let limit: number | null = null;
  let maxImages = 5;
  let defaultPrice = 0;
  let defaultTab: ProductTab = "NEW";
  let createMissingCategories = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--create-categories") {
      createMissingCategories = true;
      continue;
    }

    const next = args[index + 1];
    if (!next) {
      throw new Error(`Thiếu giá trị cho ${arg}`);
    }

    if (arg === "--root") {
      rootDir = next;
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      limit = parsePositiveInt(next, "--limit");
      index += 1;
      continue;
    }
    if (arg === "--max-images") {
      maxImages = parsePositiveInt(next, "--max-images");
      index += 1;
      continue;
    }
    if (arg === "--default-price") {
      defaultPrice = parseNonNegativeInt(next, "--default-price");
      index += 1;
      continue;
    }
    if (arg === "--default-tab") {
      const tab = next.trim().toUpperCase();
      if (tab !== "NEW" && tab !== "BEST" && tab !== "SALE") {
        throw new Error(`--default-tab không hợp lệ: ${next}. Chỉ nhận NEW|BEST|SALE`);
      }
      defaultTab = tab;
      index += 1;
      continue;
    }

    throw new Error(`Tham số không hợp lệ: ${arg}`);
  }

  if (!rootDir.trim()) {
    throw new Error("Thiếu --root <path>.");
  }

  return {
    rootDir: path.resolve(process.cwd(), rootDir.trim()),
    dryRun,
    limit,
    maxImages,
    defaultPrice,
    defaultTab,
    createMissingCategories,
  };
};

const getR2Config = (): R2Config => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID?.trim() ?? process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY?.trim() ?? process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.R2_BUCKET?.trim() ?? "";
  const region = process.env.R2_REGION?.trim() || "auto";
  const endpoint =
    process.env.R2_ENDPOINT?.trim() || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  const publicBaseUrl = normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL?.trim() ?? "");

  const missing: string[] = [];

  if (!accountId && !process.env.R2_ENDPOINT?.trim()) {
    missing.push("R2_ACCOUNT_ID hoặc R2_ENDPOINT");
  }
  if (!accessKeyId) {
    missing.push("R2_ACCESS_KEY_ID");
  }
  if (!secretAccessKey) {
    missing.push("R2_SECRET_ACCESS_KEY");
  }
  if (!bucket) {
    missing.push("R2_BUCKET");
  }
  if (!publicBaseUrl) {
    missing.push("R2_PUBLIC_BASE_URL");
  }

  if (missing.length > 0) {
    throw new Error(`Thiếu cấu hình R2: ${missing.join(", ")}`);
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    endpoint,
    publicBaseUrl,
  };
};

const buildObjectKey = (categorySlug: string, productSlug: string, fileIndex: number, fileName: string) => {
  const parsed = path.parse(fileName);
  const extension = parsed.ext.toLowerCase();
  const cleanName = sanitizeFileName(parsed.name || `image-${fileIndex + 1}`) || `image-${fileIndex + 1}`;
  const filePart = `${String(fileIndex + 1).padStart(2, "0")}-${cleanName}${extension}`;
  return `products/${categorySlug}/${productSlug}/${filePart}`;
};

const uploadFileToR2 = async (
  client: S3Client,
  config: R2Config,
  localPath: string,
  key: string,
  contentType: string
) => {
  const body = await readFile(localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${config.publicBaseUrl}/${key}`;
};

const run = async () => {
  await loadEnvFiles();
  const { prisma } = await import("../src/lib/prisma");
  try {
    const options = parseArgs();
    const rootStat = await stat(options.rootDir).catch(() => null);
    if (!rootStat || !rootStat.isDirectory()) {
      throw new Error(`Không tìm thấy thư mục root: ${options.rootDir}`);
    }

  const r2Config = options.dryRun ? null : getR2Config();
  const r2Client =
    options.dryRun || !r2Config
      ? null
      : new S3Client({
          region: r2Config.region,
          endpoint: r2Config.endpoint,
          credentials: {
            accessKeyId: r2Config.accessKeyId,
            secretAccessKey: r2Config.secretAccessKey,
          },
        });

  const categoryRows = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  const categoryBySlug = new Map<string, CategoryRecord>();
  const categoryByName = new Map<string, CategoryRecord>();
  for (const category of categoryRows) {
    const record: CategoryRecord = { id: category.id, slug: category.slug, name: category.name };
    categoryBySlug.set(category.slug, record);
    categoryByName.set(normalizeForCompare(category.name), record);
  }

  const existingProducts = await prisma.product.findMany({
    select: {
      slug: true,
      name: true,
      categoryId: true,
    },
  });
  const productBySlug = new Map<string, ExistingProductRecord>(
    existingProducts.map((item) => [
      item.slug,
      {
        slug: item.slug,
        name: item.name,
        categoryId: item.categoryId,
      },
    ])
  );
  const slugSourceInThisRun = new Map<string, string>();

  const summary: Summary = {
    categoryFolders: 0,
    matchedCategories: 0,
    createdCategories: 0,
    missingCategories: 0,
    productFolders: 0,
    createdProducts: 0,
    updatedProducts: 0,
    skippedNoImage: 0,
    uploadedImages: 0,
    failedProducts: 0,
  };

  const missingCategoryNames: string[] = [];
  const categoryDirs = (await listDirectories(options.rootDir)).sort((a, b) =>
    collator.compare(a.name, b.name)
  );
  summary.categoryFolders = categoryDirs.length;

  console.log(
    `[import-folders] Start ${options.dryRun ? "(dry-run)" : ""} | root=${options.rootDir} | maxImages=${options.maxImages}`
  );

  let processedProducts = 0;

  for (const categoryDir of categoryDirs) {
    if (options.limit !== null && processedProducts >= options.limit) {
      break;
    }

    const categoryFolderName = categoryDir.name;
    const categoryFolderSlug = slugify(categoryFolderName);
    const categoryFolderPath = path.join(options.rootDir, categoryFolderName);
    const normalizedCategoryName = normalizeForCompare(categoryFolderName);

    let category =
      categoryBySlug.get(categoryFolderSlug) ?? categoryByName.get(normalizedCategoryName) ?? null;

    if (!category && options.createMissingCategories) {
      const createName = toDisplayName(categoryFolderName) || categoryFolderName;
      if (options.dryRun) {
        category = {
          id: `dryrun-${categoryFolderSlug}`,
          slug: categoryFolderSlug,
          name: createName,
          isDryRun: true,
        };
      } else {
        const created = await prisma.category.create({
          data: {
            name: createName,
            slug: categoryFolderSlug,
            isActive: true,
            sortOrder: 999,
          },
          select: {
            id: true,
            slug: true,
            name: true,
          },
        });
        category = created;
      }

      summary.createdCategories += 1;
      categoryBySlug.set(category.slug, category);
      categoryByName.set(normalizeForCompare(category.name), category);
    }

    if (!category) {
      summary.missingCategories += 1;
      missingCategoryNames.push(categoryFolderName);
      console.log(`[import-folders] Skip category (không map được): ${categoryFolderName}`);
      continue;
    }

    summary.matchedCategories += 1;
    const productDirs = (await listDirectories(categoryFolderPath)).sort((a, b) =>
      collator.compare(a.name, b.name)
    );

    for (const productDir of productDirs) {
      if (options.limit !== null && processedProducts >= options.limit) {
        break;
      }

      processedProducts += 1;
      summary.productFolders += 1;

      const productFolderName = productDir.name;
      const productFolderPath = path.join(categoryFolderPath, productFolderName);
      const relativeProductPath = path.relative(options.rootDir, productFolderPath).replace(/\\/g, "/");
      const displayName = toDisplayName(productFolderName) || productFolderName;

      const fileEntries = await readdir(productFolderPath, { withFileTypes: true });
      const imageEntries = fileEntries
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .sort((a, b) => collator.compare(a.name, b.name))
        .slice(0, options.maxImages);

      if (imageEntries.length === 0) {
        summary.skippedNoImage += 1;
        console.log(`[import-folders] Skip product (không có ảnh): ${relativeProductPath}`);
        continue;
      }

      const baseSlug = trimSlug(`${category.slug}-${slugify(productFolderName)}`);
      const stableSlug = getStableSlug(category.slug, productFolderName, relativeProductPath);

      let chosenSlug = baseSlug;
      const existingBase = productBySlug.get(baseSlug);
      if (
        existingBase &&
        (existingBase.categoryId !== category.id ||
          normalizeForCompare(existingBase.name) !== normalizeForCompare(displayName))
      ) {
        chosenSlug = stableSlug;
      }

      if (slugSourceInThisRun.has(chosenSlug) && slugSourceInThisRun.get(chosenSlug) !== relativeProductPath) {
        let suffixIndex = 2;
        let nextSlug = trimSlug(`${chosenSlug}-${suffixIndex}`);
        while (slugSourceInThisRun.has(nextSlug) && slugSourceInThisRun.get(nextSlug) !== relativeProductPath) {
          suffixIndex += 1;
          nextSlug = trimSlug(`${chosenSlug}-${suffixIndex}`);
        }
        chosenSlug = nextSlug;
      }
      slugSourceInThisRun.set(chosenSlug, relativeProductPath);

      try {
        const imageUrls: string[] = [];
        for (const [index, imageEntry] of imageEntries.entries()) {
          const absoluteImagePath = path.join(productFolderPath, imageEntry.name);
          const key = buildObjectKey(category.slug, chosenSlug, index, imageEntry.name);
          const contentType = contentTypeFromExt(path.extname(imageEntry.name));
          if (options.dryRun || !r2Config || !r2Client) {
            const base = process.env.R2_PUBLIC_BASE_URL?.trim()
              ? normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL)
              : "https://example.r2.dev";
            imageUrls.push(`${base}/${key}`);
          } else {
            const uploadedUrl = await uploadFileToR2(r2Client, r2Config, absoluteImagePath, key, contentType);
            imageUrls.push(uploadedUrl);
            summary.uploadedImages += 1;
          }
        }

        const primaryImage = imageUrls[0] ?? null;
        const existedBefore = productBySlug.has(chosenSlug);

        if (!options.dryRun) {
          const upserted = await prisma.$transaction(async (tx) => {
            const product = await tx.product.upsert({
              where: {
                slug: chosenSlug,
              },
              update: {
                name: displayName,
                categoryId: category.id,
                imageUrl: primaryImage,
                inStock: true,
                isPublished: true,
                status: PRODUCT_STATUS_ACTIVE,
              },
              create: {
                name: displayName,
                slug: chosenSlug,
                categoryId: category.id,
                imageUrl: primaryImage,
                price: options.defaultPrice,
                originalPrice: null,
                tab: options.defaultTab,
                inStock: true,
                isPublished: true,
                status: PRODUCT_STATUS_ACTIVE,
              },
              select: {
                id: true,
              },
            });

            await tx.productImage.deleteMany({
              where: {
                productId: product.id,
                variantId: null,
              },
            });

            await tx.productImage.createMany({
              data: imageUrls.map((url, index) => ({
                productId: product.id,
                url,
                alt: `${displayName} - ${index + 1}`,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            });

            return product;
          });

          productBySlug.set(chosenSlug, {
            slug: chosenSlug,
            name: displayName,
            categoryId: category.id,
          });
          if (existedBefore) {
            summary.updatedProducts += 1;
            console.log(`[import-folders] Updated: ${upserted.id} | ${chosenSlug}`);
          } else {
            summary.createdProducts += 1;
            console.log(`[import-folders] Created: ${upserted.id} | ${chosenSlug}`);
          }
        } else {
          if (existedBefore) {
            summary.updatedProducts += 1;
            console.log(`[import-folders][dry-run] Would update: ${chosenSlug}`);
          } else {
            summary.createdProducts += 1;
            productBySlug.set(chosenSlug, {
              slug: chosenSlug,
              name: displayName,
              categoryId: category.id,
            });
            console.log(`[import-folders][dry-run] Would create: ${chosenSlug}`);
          }
        }
      } catch (error) {
        summary.failedProducts += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[import-folders] Failed: ${relativeProductPath} | ${message}`);
      }
    }
  }

  console.log("\n[import-folders] Summary");
  console.log(`- Category folders: ${summary.categoryFolders}`);
  console.log(`- Matched categories: ${summary.matchedCategories}`);
  console.log(`- Created categories: ${summary.createdCategories}`);
  console.log(`- Missing categories: ${summary.missingCategories}`);
  console.log(`- Product folders scanned: ${summary.productFolders}`);
  console.log(`- Created products: ${summary.createdProducts}`);
  console.log(`- Updated products: ${summary.updatedProducts}`);
  console.log(`- Skipped (no image): ${summary.skippedNoImage}`);
  console.log(`- Uploaded images: ${summary.uploadedImages}`);
  console.log(`- Failed products: ${summary.failedProducts}`);

    if (missingCategoryNames.length > 0) {
      const preview = missingCategoryNames.slice(0, 20).join(", ");
      console.log(`- Missing category list (first ${Math.min(missingCategoryNames.length, 20)}): ${preview}`);
    }
  } finally {
    await prisma.$disconnect();
  }
};

void run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[import-folders] ERROR: ${message}`);
  process.exitCode = 1;
});
