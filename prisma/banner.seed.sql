START TRANSACTION;

-- Cập nhật giá trị này theo R2_PUBLIC_BASE_URL của môi trường trước khi chạy file SQL.
SET @r2_public_base_url = 'https://pub-17791ea5bb48479d8306bc1334de3cd8.r2.dev';

INSERT INTO `Banner` (
  `id`,
  `slug`,
  `title`,
  `subtitle`,
  `imageUrl`,
  `sortOrder`,
  `isActive`,
  `updatedAt`
)
VALUES
  (
    'banner_phong_khach',
    'banner-phong-khach',
    'Banner phòng khách cao cấp',
    'Nâng tầm không gian sống cùng nội thất xuất Âu.',
    CONCAT(TRIM(TRAILING '/' FROM @r2_public_base_url), '/banners/slider-1.jpg'),
    1,
    true,
    NOW(3)
  ),
  (
    'banner_phong_ngu',
    'banner-phong-ngu',
    'Banner nội thất phòng ngủ',
    'Thiết kế hiện đại, chất liệu cao cấp.',
    CONCAT(TRIM(TRAILING '/' FROM @r2_public_base_url), '/banners/slider-2.jpg'),
    2,
    true,
    NOW(3)
  ),
  (
    'banner_lavabo',
    'banner-lavabo',
    'Bộ sưu tập Lavabo mới về',
    'Tổ Ấm Hoàn Hảo tuyển chọn mẫu đẹp mỗi tuần.',
    CONCAT(TRIM(TRAILING '/' FROM @r2_public_base_url), '/banners/hero-banner.jpg'),
    3,
    true,
    NOW(3)
  ),
  (
    'banner_bo_suu_tap',
    'banner-bo-suu-tap',
    'Banner bộ sưu tập nội thất',
    'Ưu đãi nổi bật theo từng không gian.',
    CONCAT(TRIM(TRAILING '/' FROM @r2_public_base_url), '/banners/slider-5.jpg'),
    4,
    true,
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `imageUrl` = VALUES(`imageUrl`),
  `sortOrder` = VALUES(`sortOrder`),
  `isActive` = VALUES(`isActive`),
  `updatedAt` = NOW(3);

COMMIT;
