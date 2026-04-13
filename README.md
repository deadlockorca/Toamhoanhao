# Tổ Ấm Hoàn Hảo (Next.js + MySQL cPanel + Prisma)

Project đang dùng Next.js (App Router) và Prisma với provider `mysql`, phù hợp hosting cPanel.

## 1) Chạy project

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

Production:

```bash
npm run build
npm run start
```

`npm run start` đang chạy `next start -p 3000`.

## Deploy VPS (1 lệnh full)

Lệnh dưới sẽ cập nhật code mới nhất từ `origin/main`, cài dependencies, generate Prisma client, chạy migrate nếu có thư mục migration, build và restart PM2:

```bash
cd /www/wwwroot/toamhoanhao.net && git fetch origin main && git reset --hard origin/main && npm ci && npx prisma generate && (test -d prisma/migrations && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ] && npx prisma migrate deploy || echo "Skip migrate deploy: no migrations") && NODE_OPTIONS="--max-old-space-size=1024" npm run build && (pm2 describe toamhoanhao >/dev/null 2>&1 && pm2 restart toamhoanhao --update-env || pm2 start npm --name toamhoanhao --cwd /www/wwwroot/toamhoanhao.net -- start) && pm2 save && pm2 status && ss -tulpn | grep :3000 && curl -I http://127.0.0.1:3000
```

Lưu ý: `git reset --hard origin/main` sẽ xóa các thay đổi local chưa commit trên VPS.

## 2) Cấu hình MySQL trên cPanel

1. Tạo database trong cPanel (`MySQL Databases`).
2. Tạo user MySQL và gán vào database với `ALL PRIVILEGES`.
3. Lấy thông tin kết nối và điền vào `.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME"
```

Thông thường:
- `HOST=localhost` nếu app chạy cùng server cPanel.
- Nếu app chạy nơi khác (ví dụ Vercel), cần mở `Remote MySQL` và whitelist IP.

## 3) Tạo bảng và seed dữ liệu

Ở local/dev:

```bash
npm run prisma:migrate -- --name init_mysql
npm run db:seed
```

Ở production:

```bash
npm run prisma:deploy
npm run db:seed
```

## 4) Lệnh DB hữu ích

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:studio
```

## 4.1) Nâng cấp schema V2 (catalog + cart + order + blog + store)

Schema đã mở rộng để phục vụ ecommerce đầy đủ:
- Sản phẩm biến thể: `ProductVariant`, `ProductImage`, `ProductSpec`, `Collection`, `CollectionItem`
- Bán hàng: `Cart`, `CartItem`, `CustomerAddress`, `CustomerOrder`, `OrderItem`, `Payment`, `Shipment`, `OrderStatusHistory`
- Nội dung: `PostCategory`, `PostTag`, `Post`, `PostTagItem`
- Hệ thống: `StoreLocation`, `NewsletterSubscriber`, `MenuItem`, `Promotion`, `Coupon`, `CouponUsage`

### Cách áp dụng an toàn (khuyến nghị)

1. Sao lưu DB trước.
2. Chạy:

```bash
npm run prisma:generate
npm run prisma:push
```

### SQL thủ công trên hosting

Nếu không dùng được Prisma CLI trên host, chạy file:

- `prisma/ecommerce-v2.extend.sql`

File này được tạo theo hướng mở rộng schema cũ -> mới, không chứa lệnh `DROP`.

## 5) File chính

- Prisma schema: `prisma/schema.prisma`
- Seed data: `prisma/seed.ts`
- Prisma client: `src/lib/prisma.ts`
- API sản phẩm: `src/app/api/products/route.ts`

Trang chủ hiện có fallback dữ liệu cứng. Khi DB có dữ liệu, trang sẽ tự gọi `/api/products`.

## Quản trị sản phẩm nhanh

- Truy cập: `/admin/products`
- API quản trị:
  - `GET/POST /api/admin/products`
  - `PATCH/DELETE /api/admin/products/:id`

### Quản trị mở rộng (v2)

- Biến thể: `/admin/variants`
  - `GET/POST /api/admin/variants`
  - `PATCH/DELETE /api/admin/variants/:id`
- Bộ sưu tập: `/admin/collections`
  - `GET/POST /api/admin/collections`
  - `PATCH/DELETE /api/admin/collections/:id`
- Đơn hàng: `/admin/orders`
  - `GET/POST /api/admin/orders`
  - `PATCH /api/admin/orders/:id`

Trang này đang được khóa Basic Auth qua `proxy.ts`.

Biến môi trường cần có:

```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="doi-mat-khau-rat-manh"
```

### Phân quyền admin theo vai trò

- `ADMIN`: toàn quyền tất cả khu vực quản trị.
- `MEDIA`: chỉ quản lý banner + bộ sưu tập.
- `ORDER_STAFF`: chỉ quản lý đơn hàng.

Tài khoản `MEDIA` và `ORDER_STAFF` được tạo trực tiếp trong trang quản trị:
- `/admin/staff`

`ADMIN` vẫn đăng nhập bằng biến môi trường `ADMIN_USERNAME`/`ADMIN_PASSWORD`.

Khi đăng nhập vào `/admin`:
- `ADMIN` được chuyển vào `/admin/products`
- `MEDIA` được chuyển vào `/admin/banners`
- `ORDER_STAFF` được chuyển vào `/admin/orders`

Nếu trình duyệt đang nhớ tài khoản cũ, bấm nút `Đổi tài khoản` trong thanh admin (hoặc truy cập `/admin/switch-account`) để nhập lại tài khoản khác.

## Upload ảnh bằng Cloudflare R2

Trang admin đã có nút upload ảnh trực tiếp lên R2 tại:
- `/admin/products`
- `/admin/variants`
- `/admin/collections`

Sau khi upload thành công, URL ảnh sẽ tự điền vào ô `imageUrl`.

Biến môi trường cần thêm:

```env
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET="your_bucket_name"
R2_PUBLIC_BASE_URL="https://pub-xxxxxxxx.r2.dev"

# Optional
R2_REGION="auto"
R2_MAX_FILE_SIZE_BYTES="8388608"
```

Nếu bạn dùng endpoint tùy chỉnh thì có thể thêm:

```env
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
```

## Import hàng loạt từ thư mục (cha = danh mục)

Nếu bạn có cấu trúc:

```text
<root>/
  <danh-muc-1>/
    <ten-san-pham-a>/
      01.jpg
      02.jpg
    <ten-san-pham-b>/
      a.png
  <danh-muc-2>/
    <ten-san-pham-c>/
      1.webp
```

Thì có thể import tự động vào DB + upload ảnh lên R2:

```bash
npm run import:folders -- --root "/duong-dan/thu-muc-goc"
```

Gợi ý chạy thử trước:

```bash
npm run import:folders -- --root "/duong-dan/thu-muc-goc" --dry-run --limit 20
```

Tuỳ chọn hay dùng:

- `--create-categories`: tự tạo danh mục nếu thư mục cha chưa có trong DB
- `--max-images 5`: giới hạn số ảnh mỗi sản phẩm (mặc định 5)
- `--default-price 0`: giá mặc định cho sản phẩm mới
- `--default-tab NEW|BEST|SALE`: tab mặc định cho sản phẩm mới

## Đăng ký / Đăng nhập người dùng

- Trang tài khoản: `/tai-khoan`
- API auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/auth/google/start`
  - `GET /api/auth/google/callback`

### Đăng nhập Google OAuth

Thêm biến môi trường:

```env
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
APP_BASE_URL="https://your-domain.com"

# Optional: nếu bỏ trống sẽ tự dùng <origin>/api/auth/google/callback
GOOGLE_REDIRECT_URI="https://your-domain.com/api/auth/google/callback"
```

Trong Google Cloud Console, thêm redirect URI trùng với endpoint callback của bạn:
- `https://your-domain.com/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (khi chạy local)

### Cập nhật database cho auth

Nếu database đang chạy bản cũ, chạy một trong 2 cách sau:

1. Prisma (khuyến nghị)

```bash
npm run prisma:push
```

2. SQL thủ công trên hosting

- Chạy file: `prisma/auth.add-user-session.sql`
