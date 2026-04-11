import { prisma } from "@/lib/prisma";

const BANNER_KIND_HOTFIX_MESSAGE =
  "Database chưa hỗ trợ loại banner CATEGORY. Chạy `npm run db:fix:banner-kind` (hoặc SQL hotfix tương ứng) rồi thử lại.";

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

let bannerKindSchemaEnsurePromise: Promise<void> | null = null;

const shouldAttachBannerKindHotfixMessage = (message: string) => {
  return (
    /Data truncated for column 'kind'/i.test(message) ||
    /Unknown column 'kind'/i.test(message) ||
    /Incorrect (?:string )?value: .* for column 'kind'/i.test(message) ||
    /ALTER command denied/i.test(message) ||
    /Access denied/i.test(message)
  );
};

export const toBannerSchemaErrorMessage = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : "";
  if (shouldAttachBannerKindHotfixMessage(message)) {
    return `${fallback} ${BANNER_KIND_HOTFIX_MESSAGE}`;
  }
  return fallback;
};

const runBannerKindSchemaEnsure = async () => {
  const rows = await prisma.$queryRawUnsafe<Array<{ total: number | bigint }>>(BANNER_KIND_COLUMN_EXISTS_SQL);
  const columnExists = Number(rows[0]?.total ?? 0) > 0;

  if (!columnExists) {
    await prisma.$executeRawUnsafe(ADD_BANNER_KIND_COLUMN_SQL);
  }

  await prisma.$executeRawUnsafe(MODIFY_BANNER_KIND_COLUMN_SQL);
};

export const ensureBannerKindSchema = async () => {
  if (!bannerKindSchemaEnsurePromise) {
    bannerKindSchemaEnsurePromise = runBannerKindSchemaEnsure().catch((error) => {
      bannerKindSchemaEnsurePromise = null;
      throw error;
    });
  }

  return bannerKindSchemaEnsurePromise;
};
