import { ProductStatus } from "@prisma/client";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type CliOptions = {
  dryRun: boolean;
  force: boolean;
  limitCategories: number | null;
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

const parsePositiveInt = (value: string, flag: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} phai la so nguyen duong.`);
  }
  return Math.floor(parsed);
};

const printUsage = () => {
  console.log(`
Bootstrap bo suu tap tu danh muc:
  npm run collections:bootstrap -- --dry-run
  npm run collections:bootstrap

Tuy chon:
  --dry-run               Chi mo phong, khong ghi DB
  --force                 Cho phep chay du Collection da ton tai
  --limit-categories <n>  Gioi han so danh muc xu ly
  --help                  Hien thi huong dan
`);
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  let dryRun = false;
  let force = false;
  let limitCategories: number | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--limit-categories") {
      const next = args[index + 1];
      if (!next) {
        throw new Error("Thieu gia tri cho --limit-categories");
      }
      limitCategories = parsePositiveInt(next, "--limit-categories");
      index += 1;
      continue;
    }

    throw new Error(`Tham so khong hop le: ${arg}`);
  }

  return {
    dryRun,
    force,
    limitCategories,
  };
};

const chunkArray = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const run = async () => {
  await loadEnvFiles();
  const options = parseArgs();
  const { prisma } = await import("../src/lib/prisma");

  try {
    const productFilter = {
      inStock: true,
      isPublished: true,
      status: ProductStatus.ACTIVE,
    } as const;

    const existingCollections = await prisma.collection.count();
    if (existingCollections > 0 && !options.force) {
      console.log(
        `[collections-bootstrap] Stop: da co ${existingCollections} bo suu tap. Dung --force neu muon dong bo lai.`
      );
      return;
    }

    const existingCollectionSlugs = new Set(
      (
        await prisma.collection.findMany({
          select: { slug: true },
        })
      ).map((item) => item.slug)
    );

    const allCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        products: {
          some: productFilter,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        products: {
          where: productFilter,
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    const categories =
      options.limitCategories === null
        ? allCategories
        : allCategories.slice(0, options.limitCategories);

    if (categories.length === 0) {
      console.log("[collections-bootstrap] Khong co danh muc nao co san pham de tao bo suu tap.");
      return;
    }

    let createdCollections = 0;
    let updatedCollections = 0;
    let linkedItems = 0;

    console.log(
      `[collections-bootstrap] Start ${options.dryRun ? "(dry-run)" : ""} | categories=${categories.length}`
    );

    for (const [categoryIndex, category] of categories.entries()) {
      const imageUrl = category.products.find((item) => Boolean(item.imageUrl?.trim()))?.imageUrl ?? null;
      const itemRows = category.products.map((product, index) => ({
        productId: product.id,
        sortOrder: index,
      }));
      const isExisting = existingCollectionSlugs.has(category.slug);

      if (options.dryRun) {
        if (isExisting) {
          updatedCollections += 1;
        } else {
          createdCollections += 1;
        }
        linkedItems += itemRows.length;
        console.log(
          `[collections-bootstrap][dry-run] ${isExisting ? "Update" : "Create"} ${category.slug} | items=${itemRows.length}`
        );
        continue;
      }

      const collection = await prisma.collection.upsert({
        where: {
          slug: category.slug,
        },
        update: {
          name: category.name,
          description: `San pham thuoc danh muc ${category.name}.`,
          imageUrl,
          isActive: true,
          sortOrder: category.sortOrder ?? categoryIndex,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: `San pham thuoc danh muc ${category.name}.`,
          imageUrl,
          isActive: true,
          sortOrder: category.sortOrder ?? categoryIndex,
        },
        select: {
          id: true,
        },
      });

      if (isExisting) {
        updatedCollections += 1;
      } else {
        createdCollections += 1;
      }

      await prisma.collectionItem.deleteMany({
        where: {
          collectionId: collection.id,
        },
      });

      for (const chunk of chunkArray(itemRows, 500)) {
        await prisma.collectionItem.createMany({
          data: chunk.map((item) => ({
            collectionId: collection.id,
            productId: item.productId,
            sortOrder: item.sortOrder,
          })),
        });
      }

      linkedItems += itemRows.length;
      existingCollectionSlugs.add(category.slug);
      console.log(`[collections-bootstrap] Synced ${category.slug} | items=${itemRows.length}`);
    }

    console.log("\n[collections-bootstrap] Summary");
    console.log(`- Categories processed: ${categories.length}`);
    console.log(`- Collections created: ${createdCollections}`);
    console.log(`- Collections updated: ${updatedCollections}`);
    console.log(`- Collection items linked: ${linkedItems}`);
  } finally {
    await prisma.$disconnect();
  }
};

void run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[collections-bootstrap] ERROR: ${message}`);
  process.exitCode = 1;
});

