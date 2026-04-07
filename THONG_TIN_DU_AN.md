# Thông Tin Dự Án Tổ Ấm Hoàn Hảo

## 1) Dự án viết bằng gì?
- Ngôn ngữ chính: TypeScript
- Frontend: React + Next.js (App Router)
- Backend API: Next.js Route Handlers (Node.js)
- CSDL: MySQL
- ORM: Prisma
- Style UI: CSS + Tailwind CSS
- Upload file ảnh: AWS SDK S3-compatible (Cloudflare R2)

## 2) Stack kỹ thuật đang dùng
- Next.js: `16.2.1`
- React: `19.2.4`
- Prisma: `6.17.1`
- Node.js khuyến nghị: `20.x` (đang phù hợp với host hiện tại)

## 3) Kiến trúc tổng quan
- `src/app/*`: các trang giao diện (App Router)
- `src/app/api/*`: API cho frontend/admin
- `src/components/*`: component UI dùng lại
- `src/lib/*`: logic nghiệp vụ (auth, prisma, r2, admin services)
- `prisma/schema.prisma`: schema database
- `prisma/seed.ts`: dữ liệu mẫu ban đầu
- `server.js`: runtime server cho production (có xử lý chống sinh file `core.*`)

## 4) Chức năng chính hiện có
- Trang chủ, trang nội dung, trang liên hệ/hệ thống cửa hàng
- Trang tài khoản: đăng ký, đăng nhập, đăng xuất, lấy thông tin phiên đăng nhập
- Admin sản phẩm, biến thể, bộ sưu tập, đơn hàng
- Trang chi tiết sản phẩm theo slug: `/san-pham/[slug]`
- Upload ảnh lên Cloudflare R2
- Hỗ trợ nhiều ảnh cho sản phẩm (đang giới hạn tối đa 5 ảnh)
- Khi xóa sản phẩm có xử lý xóa ảnh liên quan trên R2 (nếu là URL thuộc bucket cấu hình)

## 5) Database
- Provider: `mysql`
- Kết nối qua biến môi trường:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME"
```

- Các nhóm bảng chính:
- Catalog: `Category`, `Product`, `ProductVariant`, `ProductImage`, `ProductSpec`, `Collection`
- Bán hàng: `Cart`, `CartItem`, `CustomerOrder`, `OrderItem`, `Payment`, `Shipment`
- Nội dung: `Post`, `PostCategory`, `PostTag`
- Hệ thống: `SiteSetting`, `Banner`, `StoreLocation`, `NewsletterSubscriber`
- Người dùng: `User`, `UserSession`

## 6) Xác thực và bảo mật
- User auth:
- Mật khẩu hash bằng `scrypt`
- Session token lưu DB, cookie tên `toam_session`
- Admin auth:
- Basic Auth qua `middleware.ts` cho `/admin/*` và `/api/admin/*`
- Cần `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## 7) Lưu trữ ảnh Cloudflare R2
Biến môi trường cần có:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
R2_REGION=auto
R2_MAX_FILE_SIZE_BYTES=8388608
```

## 8) Scripts quan trọng

```bash
npm run dev             # Chạy local
npm run build           # Build production
npm run start           # Chạy production (qua server.js)
npm run prisma:generate # Generate Prisma client
npm run prisma:push     # Đồng bộ schema DB
npm run prisma:migrate  # Tạo migration local
npm run prisma:deploy   # Chạy migration production
npm run db:seed         # Seed dữ liệu
```

## 9) Gợi ý quy trình làm việc
- Local dev: sửa code -> `npm run dev`
- Đồng bộ DB: `npm run prisma:push`
- Trước khi deploy: `npm run build`
- Deploy host: upload bản build theo gói standalone đang dùng

## 10) Ghi chú vận hành host
- `server.js` có xử lý giảm lỗi crash tạo file `core.*` trên Linux host:
- tắt core dump limit
- dọn file `core` và `core.*` định kỳ
