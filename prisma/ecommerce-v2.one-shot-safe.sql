-- One-shot safe SQL for cPanel/phpMyAdmin
-- Goal: import one file and finish V2 core schema without breaking existing data.
-- Strategy:
-- 1) Add missing columns only when they do not exist.
-- 2) Create missing V2 tables with CREATE TABLE IF NOT EXISTS.
-- 3) Avoid foreign-key migrations here to reduce import failure risk on shared hosting.

SET NAMES utf8mb4;
SET @OLD_SQL_MODE := @@SESSION.sql_mode;
SET SESSION sql_mode = REPLACE(@@SESSION.sql_mode, 'ANSI_QUOTES', '');

-- ------------------------------------------------------------
-- 1) Safe ALTER on existing tables
-- ------------------------------------------------------------

-- Product.brand
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'brand'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `brand` VARCHAR(191) NULL",
  "SELECT 'skip Product.brand'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.dimensions
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'dimensions'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `dimensions` VARCHAR(191) NULL",
  "SELECT 'skip Product.dimensions'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.isPublished
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'isPublished'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT TRUE",
  "SELECT 'skip Product.isPublished'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.material
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'material'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `material` VARCHAR(191) NULL",
  "SELECT 'skip Product.material'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.seoDescription
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'seoDescription'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `seoDescription` VARCHAR(191) NULL",
  "SELECT 'skip Product.seoDescription'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.seoTitle
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'seoTitle'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `seoTitle` VARCHAR(191) NULL",
  "SELECT 'skip Product.seoTitle'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.shortDescription
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'shortDescription'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `shortDescription` VARCHAR(191) NULL",
  "SELECT 'skip Product.shortDescription'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.status
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'status'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `status` ENUM('DRAFT','ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE'",
  "SELECT 'skip Product.status'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Product.totalSold
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Product'
    AND COLUMN_NAME = 'totalSold'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `Product` ADD COLUMN `totalSold` INTEGER NOT NULL DEFAULT 0",
  "SELECT 'skip Product.totalSold'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ContactLead.userId
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ContactLead'
    AND COLUMN_NAME = 'userId'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `ContactLead` ADD COLUMN `userId` VARCHAR(191) NULL",
  "SELECT 'skip ContactLead.userId'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- User.isActive
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'isActive'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT TRUE",
  "SELECT 'skip User.isActive'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- User.lastLoginAt
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'lastLoginAt'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `User` ADD COLUMN `lastLoginAt` DATETIME(3) NULL",
  "SELECT 'skip User.lastLoginAt'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- User.phone
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'phone'
);
SET @sql := IF(
  @exists = 0,
  "ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL",
  "SELECT 'skip User.phone'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Banner.kind
SET @banner_table_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Banner'
);
SET @exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Banner'
    AND COLUMN_NAME = 'kind'
);
SET @sql := IF(
  @banner_table_exists = 0,
  "SELECT 'skip Banner table missing'",
  IF(
    @exists = 0,
    "ALTER TABLE `Banner` ADD COLUMN `kind` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO' AFTER `slug`",
    "SELECT 'skip Banner.kind add column'"
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @banner_table_exists = 0,
  "SELECT 'skip Banner table missing'",
  "ALTER TABLE `Banner` MODIFY COLUMN `kind` ENUM('HERO','POPUP','CATEGORY') NOT NULL DEFAULT 'HERO'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2) Create missing V2 tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ProductVariant` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `sku` VARCHAR(191) NULL,
  `barcode` VARCHAR(191) NULL,
  `option1` VARCHAR(191) NULL,
  `option2` VARCHAR(191) NULL,
  `option3` VARCHAR(191) NULL,
  `imageUrl` VARCHAR(191) NULL,
  `price` INTEGER NOT NULL,
  `originalPrice` INTEGER NULL,
  `costPrice` INTEGER NULL,
  `stockQuantity` INTEGER NOT NULL DEFAULT 0,
  `inStock` BOOLEAN NOT NULL DEFAULT TRUE,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `weightGrams` INTEGER NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductVariant_sku_key` (`sku`),
  KEY `ProductVariant_productId_isActive_idx` (`productId`, `isActive`),
  KEY `ProductVariant_productId_sortOrder_idx` (`productId`, `sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductImage` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NULL,
  `url` VARCHAR(191) NOT NULL,
  `alt` VARCHAR(191) NULL,
  `isPrimary` BOOLEAN NOT NULL DEFAULT FALSE,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductImage_productId_sortOrder_idx` (`productId`, `sortOrder`),
  KEY `ProductImage_variantId_idx` (`variantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductSpec` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductSpec_productId_sortOrder_idx` (`productId`, `sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Collection` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `imageUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Collection_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CollectionItem` (
  `id` VARCHAR(191) NOT NULL,
  `collectionId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CollectionItem_collectionId_productId_key` (`collectionId`, `productId`),
  KEY `CollectionItem_collectionId_sortOrder_idx` (`collectionId`, `sortOrder`),
  KEY `CollectionItem_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PostCategory` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PostCategory_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PostTag` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PostTag_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Post` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `excerpt` VARCHAR(191) NULL,
  `content` LONGTEXT NULL,
  `thumbnailUrl` VARCHAR(191) NULL,
  `authorName` VARCHAR(191) NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `seoTitle` VARCHAR(191) NULL,
  `seoDescription` VARCHAR(191) NULL,
  `publishedAt` DATETIME(3) NULL,
  `categoryId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Post_slug_key` (`slug`),
  KEY `Post_status_publishedAt_idx` (`status`, `publishedAt`),
  KEY `Post_categoryId_idx` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PostTagItem` (
  `id` VARCHAR(191) NOT NULL,
  `postId` VARCHAR(191) NOT NULL,
  `tagId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PostTagItem_postId_tagId_key` (`postId`, `tagId`),
  KEY `PostTagItem_tagId_idx` (`tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StoreLocation` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `type` ENUM('OFFICE', 'SHOWROOM', 'FACTORY', 'WAREHOUSE') NOT NULL DEFAULT 'SHOWROOM',
  `region` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `district` VARCHAR(191) NULL,
  `address` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `workingHours` VARCHAR(191) NULL,
  `mapEmbed` VARCHAR(191) NULL,
  `mapLink` VARCHAR(191) NULL,
  `latitude` DECIMAL(10, 7) NULL,
  `longitude` DECIMAL(10, 7) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StoreLocation_slug_key` (`slug`),
  KEY `StoreLocation_isActive_sortOrder_idx` (`isActive`, `sortOrder`),
  KEY `StoreLocation_city_district_idx` (`city`, `district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `NewsletterSubscriber` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NULL,
  `source` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unsubscribedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NewsletterSubscriber_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuItem` (
  `id` VARCHAR(191) NOT NULL,
  `menuKey` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `href` VARCHAR(191) NOT NULL,
  `type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'INTERNAL',
  `targetBlank` BOOLEAN NOT NULL DEFAULT FALSE,
  `parentId` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `MenuItem_menuKey_isActive_sortOrder_idx` (`menuKey`, `isActive`, `sortOrder`),
  KEY `MenuItem_parentId_idx` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CustomerAddress` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `type` ENUM('HOME', 'OFFICE', 'OTHER') NOT NULL DEFAULT 'HOME',
  `fullName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `company` VARCHAR(191) NULL,
  `countryCode` VARCHAR(191) NOT NULL DEFAULT 'VN',
  `province` VARCHAR(191) NULL,
  `district` VARCHAR(191) NULL,
  `ward` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `addressLine1` VARCHAR(191) NOT NULL,
  `addressLine2` VARCHAR(191) NULL,
  `note` VARCHAR(191) NULL,
  `isDefaultShipping` BOOLEAN NOT NULL DEFAULT FALSE,
  `isDefaultBilling` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CustomerAddress_userId_idx` (`userId`),
  KEY `CustomerAddress_province_district_idx` (`province`, `district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Cart` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `sessionId` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'ABANDONED', 'CONVERTED') NOT NULL DEFAULT 'ACTIVE',
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cart_sessionId_key` (`sessionId`),
  KEY `Cart_userId_status_idx` (`userId`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CartItem` (
  `id` VARCHAR(191) NOT NULL,
  `cartId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NULL,
  `quantity` INTEGER NOT NULL,
  `unitPrice` INTEGER NOT NULL,
  `lineTotal` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CartItem_cartId_idx` (`cartId`),
  KEY `CartItem_productId_idx` (`productId`),
  KEY `CartItem_variantId_idx` (`variantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CustomerOrder` (
  `id` VARCHAR(191) NOT NULL,
  `orderNumber` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` ENUM('UNPAID', 'AUTHORIZED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'UNPAID',
  `fulfillmentStatus` ENUM('PENDING', 'PACKING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `subtotal` INTEGER NOT NULL DEFAULT 0,
  `discountTotal` INTEGER NOT NULL DEFAULT 0,
  `shippingFee` INTEGER NOT NULL DEFAULT 0,
  `taxTotal` INTEGER NOT NULL DEFAULT 0,
  `grandTotal` INTEGER NOT NULL DEFAULT 0,
  `couponCode` VARCHAR(191) NULL,
  `couponId` VARCHAR(191) NULL,
  `shippingAddressId` VARCHAR(191) NULL,
  `billingAddressId` VARCHAR(191) NULL,
  `customerNote` VARCHAR(191) NULL,
  `internalNote` VARCHAR(191) NULL,
  `paidAt` DATETIME(3) NULL,
  `confirmedAt` DATETIME(3) NULL,
  `canceledAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CustomerOrder_orderNumber_key` (`orderNumber`),
  KEY `CustomerOrder_userId_createdAt_idx` (`userId`, `createdAt`),
  KEY `CustomerOrder_status_paymentStatus_fulfillmentStatus_idx` (`status`, `paymentStatus`, `fulfillmentStatus`),
  KEY `CustomerOrder_couponId_idx` (`couponId`),
  KEY `CustomerOrder_shippingAddressId_idx` (`shippingAddressId`),
  KEY `CustomerOrder_billingAddressId_idx` (`billingAddressId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NULL,
  `variantId` VARCHAR(191) NULL,
  `productName` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(191) NULL,
  `optionSummary` VARCHAR(191) NULL,
  `imageUrl` VARCHAR(191) NULL,
  `quantity` INTEGER NOT NULL,
  `unitPrice` INTEGER NOT NULL,
  `originalPrice` INTEGER NULL,
  `lineTotal` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_productId_idx` (`productId`),
  KEY `OrderItem_variantId_idx` (`variantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Payment` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NULL,
  `method` ENUM('COD', 'BANK_TRANSFER', 'CARD', 'WALLET', 'OTHER') NOT NULL DEFAULT 'COD',
  `status` ENUM('UNPAID', 'AUTHORIZED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'UNPAID',
  `amount` INTEGER NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `transactionId` VARCHAR(191) NULL,
  `paidAt` DATETIME(3) NULL,
  `rawPayload` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_transactionId_key` (`transactionId`),
  KEY `Payment_orderId_status_idx` (`orderId`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Shipment` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `status` ENUM('PENDING', 'PACKING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
  `carrier` VARCHAR(191) NULL,
  `serviceLevel` VARCHAR(191) NULL,
  `trackingNumber` VARCHAR(191) NULL,
  `shippingAddressId` VARCHAR(191) NULL,
  `shippingFee` INTEGER NULL,
  `note` VARCHAR(191) NULL,
  `shippedAt` DATETIME(3) NULL,
  `deliveredAt` DATETIME(3) NULL,
  `returnedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Shipment_trackingNumber_key` (`trackingNumber`),
  KEY `Shipment_orderId_status_idx` (`orderId`, `status`),
  KEY `Shipment_shippingAddressId_idx` (`shippingAddressId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderStatusHistory` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `fromStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REFUNDED', 'FAILED') NULL,
  `toStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REFUNDED', 'FAILED') NOT NULL,
  `note` VARCHAR(191) NULL,
  `changedByUserId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderStatusHistory_orderId_createdAt_idx` (`orderId`, `createdAt`),
  KEY `OrderStatusHistory_changedByUserId_idx` (`changedByUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Promotion` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `discountType` ENUM('PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING') NOT NULL,
  `discountValue` INTEGER NOT NULL,
  `maxDiscount` INTEGER NULL,
  `minOrderValue` INTEGER NULL,
  `usageLimit` INTEGER NULL,
  `usedCount` INTEGER NOT NULL DEFAULT 0,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Promotion_slug_key` (`slug`),
  KEY `Promotion_isActive_startsAt_endsAt_idx` (`isActive`, `startsAt`, `endsAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Coupon` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `promotionId` VARCHAR(191) NULL,
  `description` VARCHAR(191) NULL,
  `discountType` ENUM('PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING') NULL,
  `discountValue` INTEGER NULL,
  `maxDiscount` INTEGER NULL,
  `minOrderValue` INTEGER NULL,
  `usageLimit` INTEGER NULL,
  `userLimit` INTEGER NULL,
  `usedCount` INTEGER NOT NULL DEFAULT 0,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coupon_code_key` (`code`),
  KEY `Coupon_promotionId_idx` (`promotionId`),
  KEY `Coupon_isActive_startsAt_endsAt_idx` (`isActive`, `startsAt`, `endsAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CouponUsage` (
  `id` VARCHAR(191) NOT NULL,
  `couponId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `orderId` VARCHAR(191) NULL,
  `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CouponUsage_couponId_orderId_key` (`couponId`, `orderId`),
  KEY `CouponUsage_couponId_userId_usedAt_idx` (`couponId`, `userId`, `usedAt`),
  KEY `CouponUsage_orderId_idx` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3) Quick verification output
-- ------------------------------------------------------------
SELECT 'ProductVariant table' AS item, COUNT(*) AS exists_count
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ProductVariant';

SET SESSION sql_mode = @OLD_SQL_MODE;
