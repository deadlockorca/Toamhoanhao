import path from "node:path";
import process from "node:process";
import { readFile } from "node:fs/promises";

import { prisma } from "../src/lib/prisma";

type CliOptions = {
  dumpFile: string;
  dryRun: boolean;
  onlyEmpty: boolean;
  includeZeroSource: boolean;
};

type PricePayload = {
  price: number;
  originalPrice: number | null;
};

type Summary = {
  dumpRowsParsed: number;
  dumpRowsUsable: number;
  localScanned: number;
  localEligible: number;
  matched: number;
  unmatched: number;
  updated: number;
  unchanged: number;
  failedUpdates: number;
};

const printUsage = () => {
  console.log(`
Backfill gia Product tu file SQL dump local (offline).

Vi du:
  npm run prices:backfill:sql -- --dry-run
  npm run prices:backfill:sql -- --apply --file ./toamhoanhao-db-export-20260404-114341.sql

Tuy chon:
  --file <path>          Duong dan file SQL dump (mac dinh: ./toamhoanhao-db-export-20260404-114341.sql)
  --dry-run              Chi mo phong, khong ghi DB (mac dinh)
  --apply                Ghi that vao DB local
  --only-empty           Chi cap nhat product dang thieu gia (mac dinh)
  --include-filled       Cap nhat ca product da co gia
  --include-zero-source  Cho phep cap nhat ca nguon co gia=0 (mac dinh: bo qua)
  --help                 Hien thi huong dan
`);
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  let dumpFile = "./toamhoanhao-db-export-20260404-114341.sql";
  let dryRun = true;
  let onlyEmpty = true;
  let includeZeroSource = false;

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
    if (arg === "--include-zero-source") {
      includeZeroSource = true;
      continue;
    }

    const next = args[index + 1];
    if (!next) {
      throw new Error(`Thieu gia tri cho ${arg}`);
    }

    if (arg === "--file") {
      dumpFile = next;
      index += 1;
      continue;
    }

    throw new Error(`Tham so khong hop le: ${arg}`);
  }

  return {
    dumpFile: path.resolve(process.cwd(), dumpFile),
    dryRun,
    onlyEmpty,
    includeZeroSource,
  };
};

const unescapeSqlString = (token: string) => {
  if (token.length < 2 || token[0] !== "'" || token[token.length - 1] !== "'") {
    return token;
  }

  const source = token.slice(1, -1);
  let output = "";

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char !== "\\" || index + 1 >= source.length) {
      output += char;
      continue;
    }

    const next = source[index + 1];
    if (next === "n") {
      output += "\n";
    } else if (next === "r") {
      output += "\r";
    } else if (next === "t") {
      output += "\t";
    } else if (next === "0") {
      output += "\0";
    } else {
      output += next;
    }
    index += 1;
  }

  return output;
};

const toNullableInt = (token: string): number | null => {
  const trimmed = token.trim();
  if (trimmed.toUpperCase() === "NULL" || trimmed.length === 0) {
    return null;
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.trunc(numeric);
};

const extractProductValuesBlock = (sql: string) => {
  const insertPrefix = "INSERT INTO `Product` VALUES ";
  const start = sql.indexOf(insertPrefix);
  if (start < 0) {
    throw new Error("Khong tim thay INSERT INTO `Product` trong file dump.");
  }

  const afterStart = start + insertPrefix.length;
  const endMarkerA = ";\n/*!40000 ALTER TABLE `Product` ENABLE KEYS */";
  const endMarkerB = ";\nUNLOCK TABLES;";

  let end = sql.indexOf(endMarkerA, afterStart);
  if (end < 0) {
    end = sql.indexOf(endMarkerB, afterStart);
  }

  if (end < 0) {
    throw new Error("Khong xac dinh duoc diem ket thuc du lieu Product trong dump.");
  }

  return sql.slice(afterStart, end).trim();
};

const parsePriceMapFromValuesBlock = (valuesBlock: string) => {
  const map = new Map<string, PricePayload>();
  let parsedRows = 0;

  let index = 0;
  while (index < valuesBlock.length) {
    while (index < valuesBlock.length && /[\s,]/.test(valuesBlock[index])) {
      index += 1;
    }

    if (index >= valuesBlock.length) {
      break;
    }

    if (valuesBlock[index] !== "(") {
      index += 1;
      continue;
    }

    index += 1;
    const fields: string[] = [];
    let current = "";
    let inString = false;
    let escaped = false;

    while (index < valuesBlock.length) {
      const char = valuesBlock[index];

      if (inString) {
        current += char;

        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === "'") {
          inString = false;
        }

        index += 1;
        continue;
      }

      if (char === "'") {
        inString = true;
        current += char;
        index += 1;
        continue;
      }

      if (char === ",") {
        fields.push(current.trim());
        current = "";
        index += 1;
        continue;
      }

      if (char === ")") {
        fields.push(current.trim());
        current = "";
        index += 1;
        break;
      }

      current += char;
      index += 1;
    }

    parsedRows += 1;

    if (fields.length < 8) {
      continue;
    }

    const slugRaw = unescapeSqlString(fields[2]);
    const slug = slugRaw.trim();
    if (!slug) {
      continue;
    }

    const price = toNullableInt(fields[6]) ?? 0;
    const originalRaw = toNullableInt(fields[7]);
    const originalPrice = originalRaw !== null && originalRaw > 0 ? originalRaw : null;

    map.set(slug, {
      price: Math.max(0, price),
      originalPrice,
    });
  }

  return {
    map,
    parsedRows,
  };
};

const run = async () => {
  const options = parseArgs();

  const summary: Summary = {
    dumpRowsParsed: 0,
    dumpRowsUsable: 0,
    localScanned: 0,
    localEligible: 0,
    matched: 0,
    unmatched: 0,
    updated: 0,
    unchanged: 0,
    failedUpdates: 0,
  };

  console.log(
    `[price-backfill-sql] Start ${options.dryRun ? "(dry-run)" : "(apply)"} | file=${options.dumpFile} | onlyEmpty=${options.onlyEmpty}`
  );

  const dumpContent = await readFile(options.dumpFile, "utf8");
  const valuesBlock = extractProductValuesBlock(dumpContent);
  const parsed = parsePriceMapFromValuesBlock(valuesBlock);
  summary.dumpRowsParsed = parsed.parsedRows;

  const sourceMap = new Map<string, PricePayload>();
  for (const [slug, payload] of parsed.map.entries()) {
    const hasValue = payload.price > 0 || (payload.originalPrice ?? 0) > 0;
    if (!options.includeZeroSource && !hasValue) {
      continue;
    }
    sourceMap.set(slug, payload);
  }

  summary.dumpRowsUsable = sourceMap.size;

  const localProducts = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      price: true,
      originalPrice: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  summary.localScanned = localProducts.length;

  const candidates = localProducts.filter((item) => {
    if (!options.onlyEmpty) {
      return true;
    }

    return item.price <= 0 && item.originalPrice === null;
  });

  summary.localEligible = candidates.length;

  for (const product of candidates) {
    const source = sourceMap.get(product.slug);
    if (!source) {
      summary.unmatched += 1;
      continue;
    }

    summary.matched += 1;

    const nextPrice = source.price;
    const nextOriginal = source.originalPrice;

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

  console.log("\n[price-backfill-sql] Summary");
  console.log(`- Dump rows parsed: ${summary.dumpRowsParsed}`);
  console.log(`- Dump rows usable: ${summary.dumpRowsUsable}`);
  console.log(`- Local scanned: ${summary.localScanned}`);
  console.log(`- Local eligible: ${summary.localEligible}`);
  console.log(`- Matched: ${summary.matched}`);
  console.log(`- Unmatched: ${summary.unmatched}`);
  console.log(`- Updated: ${summary.updated}`);
  console.log(`- Unchanged: ${summary.unchanged}`);
  console.log(`- Failed updates: ${summary.failedUpdates}`);
};

void run()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[price-backfill-sql] ERROR: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
