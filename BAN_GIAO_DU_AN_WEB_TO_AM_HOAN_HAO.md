# BÀN GIAO DỰ ÁN WEBSITE TỔ ẤM HOÀN HẢO

## 1) Thông tin chung
- Tên dự án: Website thương mại điện tử Tổ Ấm Hoàn Hảo
- Domain vận hành: `https://toamhoanhao.net`
- Mã nguồn: Next.js + Prisma + MySQL
- Nhánh triển khai chính: `main`
- Commit bàn giao tham chiếu: `82edb53`
- Ngày bàn giao: `___ / ___ / 2026`

## 2) Phạm vi chức năng đã bàn giao
- Giao diện website desktop/mobile.
- Trang chủ, danh mục, chi tiết sản phẩm, bộ sưu tập, giảm giá, bán chạy, sản phẩm mới.
- Giỏ hàng, thanh toán, đặt hàng thành công.
- Tra cứu đơn hàng cho khách.
- Tài khoản khách hàng:
  - Đăng ký
  - Đăng nhập
  - Đăng xuất
  - Lịch sử đơn hàng
- Quản trị:
  - Quản lý sản phẩm
  - Quản lý biến thể
  - Quản lý bộ sưu tập
  - Quản lý banner
  - Quản lý đơn hàng
- Upload ảnh lên Cloudflare R2 cho nội dung quản trị.
- Đã chuẩn bị backend đăng nhập Google OAuth, hiện đang tắt nút Google ở giao diện theo yêu cầu vận hành hiện tại.

## 3) Công nghệ sử dụng
- Next.js `16.2.1`
- React `19.2.4`
- Prisma `6.17.1`
- MySQL
- Cloudflare R2 (lưu ảnh)
- PM2 (process manager trên VPS)

## 4) Hạng mục bàn giao
- Toàn bộ source code dự án.
- Cấu trúc database theo `prisma/schema.prisma`.
- Tài liệu vận hành cơ bản (`README.md`, file này).
- Scripts vận hành/đồng bộ dữ liệu trong `package.json`.

## 5) Thông tin truy cập cần bàn giao cho khách (điền thực tế)
- SSH VPS:
  - IP: `________________`
  - User: `________________`
  - Port: `________________`
- Đường dẫn source trên VPS: `/www/wwwroot/toamhoanhao.net`
- Git repository: `________________`
- Tài khoản quản trị website:
  - URL: `https://toamhoanhao.net/admin`
  - Username: `________________`
  - Password: `________________`
- MySQL:
  - Host: `________________`
  - Database: `________________`
  - Username: `________________`
  - Password: `________________`
- Cloudflare R2:
  - Account ID: `________________`
  - Bucket: `________________`
  - Public base URL: `________________`
- (Tuỳ chọn) Google OAuth:
  - Client ID: `________________`
  - Client Secret: `________________`

## 6) Biến môi trường bắt buộc (.env)
```env
DATABASE_URL=

ADMIN_USERNAME=
ADMIN_PASSWORD=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
R2_REGION=auto
R2_MAX_FILE_SIZE_BYTES=8388608

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_BASE_URL=https://toamhoanhao.net
GOOGLE_REDIRECT_URI=https://toamhoanhao.net/api/auth/google/callback
```

## 7) Quy trình cập nhật phiên bản trên VPS
```bash
cd /www/wwwroot/toamhoanhao.net
git pull
NODE_OPTIONS="--max-old-space-size=1024" npm run build
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
pm2 restart toamhoanhao --update-env
pm2 status
```

## 8) Backup và khôi phục dữ liệu
### Backup MySQL
```bash
mysqldump -u <DB_USER> -p'<DB_PASS>' <DB_NAME> > toamhoanhao-backup-$(date +%F-%H%M%S).sql
```

### Restore MySQL
```bash
mysql -u <DB_USER> -p'<DB_PASS>' <DB_NAME> < toamhoanhao-backup-YYYY-MM-DD-HHMMSS.sql
```

Khuyến nghị:
- Backup định kỳ tối thiểu 1 lần/ngày.
- Giữ tối thiểu 7 bản backup gần nhất.
- Trước khi deploy lớn, backup ngay trước khi cập nhật.

## 9) Vận hành thường ngày
- Quản lý sản phẩm/banner/đơn hàng tại khu vực admin.
- Ảnh mới upload qua admin sẽ lưu trên R2.
- Đơn khách đặt được theo dõi trong admin và trang tra cứu đơn.
- Khi có thay đổi code, triển khai theo mục 7.

## 10) Checklist nghiệm thu bàn giao
- Website truy cập bình thường trên desktop/mobile.
- Đăng nhập admin hoạt động.
- CRUD sản phẩm hoạt động.
- Upload ảnh R2 hoạt động.
- Đặt hàng và tạo đơn hoạt động.
- Tra cứu đơn hàng hoạt động.
- Lịch sử đơn hàng tài khoản khách hoạt động.
- Build và restart PM2 thành công trên VPS.

## 11) Điều khoản hỗ trợ sau bàn giao (điền theo thỏa thuận)
- Thời gian bảo hành kỹ thuật: `________________`
- Phạm vi hỗ trợ: `________________`
- Kênh liên hệ hỗ trợ: `________________`
- SLA phản hồi: `________________`

## 12) Xác nhận bàn giao
- Đại diện bên bàn giao: `________________`
- Đại diện bên nhận bàn giao: `________________`
- Thời gian xác nhận: `___ / ___ / 2026`
- Ghi chú thêm: `________________`

