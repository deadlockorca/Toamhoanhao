# HƯỚNG DẪN SỬ DỤNG NHANH - 10/05/2026

## 1) Vận hành trang chủ (khối giảm giá mới)

### Mục tiêu
- Khối `Giảm giá` dưới banner lấy dữ liệu tự động từ sản phẩm giảm giá.

### Dữ liệu hiển thị
- Sản phẩm trong khối `Giảm giá` lấy từ nguồn `sale`.
- Điều kiện sale đang dùng trong hệ thống:
  - sản phẩm thuộc tab `SALE`, hoặc
  - có `originalPrice` hợp lệ và lớn hơn `price`.

### Danh mục bên trái trong khối giảm giá
- Mặc định hiển thị 7 danh mục đầu.
- Nút `Xem thêm...` chỉ xổ thêm 2 mục theo slug:
  - `khong-gian-ngoai-troi`
  - `do-cho-be`
- Khi đang xổ, nút đổi thành `Thu gọn`.

## 2) Quản trị sản phẩm để lên khối giảm giá

### Trong admin
- Vào `/admin/products`.
- Với sản phẩm cần giảm giá:
  - đặt `Giá bán` (`price`) nhỏ hơn `Giá gốc` (`originalPrice`), hoặc
  - gán tab sale nếu quy trình đội vận hành đang dùng tab.

### Kết quả ngoài site
- Trang chủ khối giảm giá sẽ tự cập nhật theo dữ liệu mới sau khi reload.

## 3) Trang Bộ sưu tập (đã đổi mô hình)
- URL: `/bo-suu-tap`
- Hiện tại đây là trang danh mục sản phẩm, không còn là trang list collection con.
- Muốn sản phẩm xuất hiện ở đây: gán sản phẩm vào category slug `bo-suu-tap`.

## 4) SEO và Search Console

### URL cần hoạt động
- `https://toamhoanhao.net/sitemap.xml`
- `https://toamhoanhao.net/robots.txt`

### Cách submit sitemap
- Vào Search Console > Sitemaps.
- Chỉ submit `sitemap.xml`.
- Không submit `robots.txt` trong mục sitemap.

## 5) Liên hệ & icon
- Email liên hệ đang hiển thị ở footer:
  - `hotro.toamhoanhao@gmail.com`
- Icon Zalo dùng file:
  - `public/social/zalo.svg`
- Icon đã áp dụng cho:
  - thanh liên hệ mobile footer
  - dock liên hệ desktop bên phải

## 6) Lệnh kiểm tra nhanh sau deploy
```bash
npm run build
npm run start
```

Kiểm tra tay:
- Trang chủ desktop/mobile.
- `/bo-suu-tap`
- `/admin` (không còn menu bộ sưu tập cũ).
- `/sitemap.xml`, `/robots.txt`.

## 7) Khi cần chỉnh tiếp
- Layout khối giảm giá trang chủ: `src/app/page.tsx`
- Nguồn data trang chủ: `src/app/api/home/route.ts`
- Footer liên hệ: `src/components/SiteFooter.tsx`
- Dock desktop bên phải: `src/components/GlobalDesktopContactDock.tsx`
