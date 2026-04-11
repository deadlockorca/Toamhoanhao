-- Hotfix: ensure Banner.kind supports CATEGORY
-- Safe to re-run.

SET NAMES utf8mb4;
SET @db_name := DATABASE();

SET @has_kind := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'Banner'
    AND COLUMN_NAME = 'kind'
);

SET @sql := IF(
  @has_kind = 0,
  "ALTER TABLE `Banner` ADD COLUMN `kind` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO' AFTER `slug`",
  "SELECT 'skip add Banner.kind'"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `Banner`
MODIFY COLUMN `kind` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO';
