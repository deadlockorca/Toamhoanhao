# BÀN GIAO CẬP NHẬT - 10/05/2026

## 1) Phạm vi cập nhật
- Cập nhật UI/UX trang chủ (khối giảm giá, danh mục, kích thước typography).
- Chuẩn hóa hành vi điều hướng trang danh mục/sản phẩm.
- Đồng bộ logic `Bộ sưu tập` theo mô hình danh mục sản phẩm.
- Cập nhật SEO kỹ thuật (structured data, sitemap, robots).
- Đồng bộ thông tin liên hệ và icon Zalo.

## 2) Các thay đổi chính đã triển khai

### 2.1 Trang chủ
- Khối `Giảm giá` dưới banner đã đổi sang bố cục mới theo mẫu:
  - Cột trái: `Danh mục sản phẩm`.
  - Cột phải: sản phẩm giảm giá nổi bật.
- Logic đã gộp vào section `Giảm giá` hiện tại (không giữ 2 section song song).
- Nút `Xem thêm...` ở danh mục trái:
  - Bấm sẽ xổ thêm đúng 2 mục: `Không gian ngoài trời`, `Đồ cho bé`.
  - Khi đang xổ sẽ đổi thành `Thu gọn`.
- Đã tinh chỉnh lại kích thước cột danh mục trái để cân đối hơn với cột sản phẩm.
- Khối `HÃY GHÉ THĂM / CỬA HÀNG TỔ ẤM...` đã giảm size thêm (mobile + desktop).

### 2.2 Bộ sưu tập
- `/bo-suu-tap` đã chuyển thành trang danh mục sản phẩm (không còn là landing list collection con).
- Trang chủ phần `Bộ sưu tập` đã đồng bộ theo logic danh mục sản phẩm.
- Admin `Bộ sưu tập` kiểu cũ đã loại khỏi menu/quyền:
  - Ẩn khỏi thanh điều hướng admin.
  - Gỡ quyền `collections` khỏi phân quyền hiển thị.
  - `/admin/collections` chuyển hướng về `/admin/products`.

### 2.3 Điều hướng và phân trang
- Sửa hành vi quay lại từ trang chi tiết sản phẩm để giữ đúng `page` của danh sách trước đó.

### 2.4 SEO kỹ thuật
- Bổ sung `metadataBase`, canonical và JSON-LD `Organization`.
- Bổ sung JSON-LD:
  - `WebSite` + `SearchAction` cho trang chủ.
  - `BreadcrumbList` cho trang danh mục/tìm kiếm/chi tiết.
  - `Product` schema cho trang chi tiết sản phẩm.
- Bổ sung:
  - `src/app/sitemap.ts` (`/sitemap.xml`)
  - `src/app/robots.ts` (`/robots.txt`)
- Trạng thái Search Console:
  - `sitemap.xml`: thành công.
  - `robots.txt`: không cần submit ở mục Sitemap.

### 2.5 Liên hệ và nhận diện
- Email liên hệ footer đổi thành: `hotro.toamhoanhao@gmail.com`.
- Icon Zalo đã đồng bộ:
  - Mobile footer.
  - Desktop dock bên phải.
  - Dùng file: `public/social/zalo.svg`.

## 3) File chính đã tác động
- `src/app/page.tsx`
- `src/app/bo-suu-tap/page.tsx`
- `src/app/api/home/route.ts`
- `src/components/SiteFooter.tsx`
- `src/components/GlobalDesktopContactDock.tsx`
- `src/components/AdminSectionNav.tsx`
- `src/lib/admin-auth.ts`
- `src/components/PublicProductGridPage.tsx`
- `src/app/layout.tsx`
- `src/app/san-pham/[slug]/page.tsx`
- `src/app/giam-gia/page.tsx`
- `src/app/san-pham-moi/page.tsx`
- `src/app/ban-chay/page.tsx`
- `src/app/danh-muc/[slug]/page.tsx`
- `src/app/bo-suu-tap/[slug]/page.tsx`
- `src/app/tim-kiem/page.tsx`
- `src/lib/seo.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `public/social/zalo.svg`

## 4) Checklist nghiệm thu nhanh
- Mở trang chủ desktop:
  - Khối giảm giá đúng bố cục mới.
  - `Xem thêm...` / `Thu gọn` hoạt động đúng.
- Mở trang chủ mobile:
  - Không vỡ layout.
- Mở `/bo-suu-tap`:
  - Hiển thị sản phẩm dạng danh mục.
- Mở `/admin`:
  - Không còn menu `Bộ sưu tập` kiểu cũ.
- Mở:
  - `/sitemap.xml`
  - `/robots.txt`
  - kiểm tra trả nội dung hợp lệ.
- Footer và dock desktop:
  - icon Zalo mới hiển thị đúng.
  - email liên hệ đúng.

## 5) Ghi chú vận hành
- Các thay đổi trên kết quả Google Search không hiện tức thì, thường cần Google crawl lại sau vài giờ đến vài ngày (có thể lâu hơn tùy truy vấn).
