# BÀN GIAO DỰ ÁN WEBSITE TỔ ẤM HOÀN HẢO

## 1) Thông tin chung
- Tên dự án: Website thương mại điện tử Tổ Ấm Hoàn Hảo
- Domain vận hành: `https://toamhoanhao.net`
- Mã nguồn: Next.js + Prisma + MySQL
- Nhánh triển khai chính: `main`

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

## 5) Quy trình cập nhật phiên bản trên VPS
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
## 6) Vận hành thường ngày
- Quản lý sản phẩm/banner/đơn hàng tại khu vực admin.
- Ảnh mới upload qua admin sẽ lưu trên R2.
- Đơn khách đặt được theo dõi trong admin và trang tra cứu đơn.
## 7) Checklist nghiệm thu bàn giao
- toamhoanhao.net/admin
- user name: admin  
- password: toamhoanhao@2026
- Website truy cập bình thường trên desktop/mobile.
- Đăng nhập admin hoạt động.
- CRUD sản phẩm hoạt động.
- Upload ảnh R2 hoạt động.
- Đặt hàng và tạo đơn hoạt động.
- Tra cứu đơn hàng hoạt động.
- Lịch sử đơn hàng tài khoản khách hoạt động.
- Build và restart PM2 thành công trên VPS.

