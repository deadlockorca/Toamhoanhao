-- Simple one-shot SQL for phpMyAdmin/cPanel
-- No PREPARE / EXECUTE statements.
-- Safe to import multiple times because it uses CREATE TABLE IF NOT EXISTS.

SET NAMES utf8mb4;

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

SELECT 'ProductVariant table' AS item, COUNT(*) AS exists_count
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ProductVariant';

