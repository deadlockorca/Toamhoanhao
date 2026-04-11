import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BANNER_KIND_COLUMN_EXISTS_SQL = `
SELECT COUNT(*) AS total
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Banner'
  AND COLUMN_NAME = 'kind'
`;

const ADD_BANNER_KIND_COLUMN_SQL = `
ALTER TABLE \`Banner\`
ADD COLUMN \`kind\` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO' AFTER \`slug\`
`;

const MODIFY_BANNER_KIND_COLUMN_SQL = `
ALTER TABLE \`Banner\`
MODIFY COLUMN \`kind\` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO'
`;

const main = async () => {
  const rows = await prisma.$queryRawUnsafe<Array<{ total: number | bigint }>>(BANNER_KIND_COLUMN_EXISTS_SQL);
  const columnExists = Number(rows[0]?.total ?? 0) > 0;

  if (!columnExists) {
    await prisma.$executeRawUnsafe(ADD_BANNER_KIND_COLUMN_SQL);
    console.log("[db:fix:banner-kind] Added Banner.kind column.");
  } else {
    console.log("[db:fix:banner-kind] Banner.kind already exists.");
  }

  await prisma.$executeRawUnsafe(MODIFY_BANNER_KIND_COLUMN_SQL);
  console.log("[db:fix:banner-kind] Banner.kind enum is now HERO, POPUP, CATEGORY.");
};

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[db:fix:banner-kind] Failed:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
