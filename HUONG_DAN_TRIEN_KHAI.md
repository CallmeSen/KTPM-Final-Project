# Hướng Dẫn Triển Khai Online Bookstore

## ✅ Đã Hoàn Thành

Dự án đã được triển khai thành công trên máy của bạn với:
- ✓ Database MySQL (Port 3306)
- ✓ Backend NestJS (Port 8000)
- ✓ Frontend Next.js (Port 3000)

## 🚀 Cách Khởi Động Ứng Dụng

### Cách 1: Sử Dụng Script Tự Động (Khuyến Nghị)

```powershell
.\start.ps1
```

Script này sẽ tự động:
1. Kiểm tra Docker
2. Khởi động MySQL Database
3. Khởi động Backend Server
4. Khởi động Frontend Server

### Cách 2: Khởi Động Thủ Công

#### 1. Khởi động Database
```powershell
docker-compose up -d db
```

#### 2. Khởi động Backend (Terminal riêng)
```powershell
cd Backend
npm run start:dev
```

#### 3. Khởi động Frontend (Terminal riêng)
```powershell
cd Frontend
npm run dev
```

## 🌐 Truy Cập Ứng Dụng

- **Frontend (Website)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql
- **Database**: localhost:3306

## 🛑 Dừng Ứng Dụng

### Sử dụng Script
```powershell
.\stop.ps1
```

### Hoặc thủ công
1. Đóng các terminal Backend và Frontend (Ctrl+C)
2. Dừng Docker containers:
```powershell
docker-compose down
```

## 📝 Thông Tin Đăng Nhập Database

- **Host**: localhost
- **Port**: 3306
- **Database**: bookstores
- **Username**: root
- **Password**: anhmuoi137

## ⚙️ Cấu Hình Môi Trường

### Backend (.env)
File `Backend\.env` đã được tạo với các biến môi trường cần thiết.

**Cần cập nhật để sử dụng đầy đủ tính năng:**

1. **Stripe Payment** (để sử dụng thanh toán):
   - `sk_test` - Lấy từ https://stripe.com
   - `STRIPE_WEBHOOK_SECRET` - Cấu hình webhook trên Stripe Dashboard

2. **Google OAuth** (để đăng nhập bằng Google):
   - `GOOGLE_CLIENT_ID` - Tạo tại Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - Tạo tại Google Cloud Console

3. **Email Service** (để gửi email reset password):
   - `MAIL_USER` - Địa chỉ Gmail của bạn
   - `MAIL_PASSWORD` - [App Password của Gmail](https://support.google.com/accounts/answer/185833)

### Frontend (.env)
File `Frontend\.env` đã được tạo và kết nối với Backend local.

## 🗃️ Database

Database sẽ tự động tạo các bảng khi Backend khởi động lần đầu (TypeORM synchronize).

Các entities chính:
- User
- Book
- Cart & CartItem
- Payment
- Notification
- Inventory
- Comment

## 📚 Tính Năng Chính

1. **Product Catalog** - Duyệt và tìm kiếm sách
2. **Shopping Cart** - Thêm sách vào giỏ hàng
3. **Payment** - Thanh toán qua Stripe
4. **Comments** - Bình luận và review sách
5. **Notifications** - Thông báo cho người dùng
6. **Authentication** - Đăng ký/Đăng nhập (JWT + Google OAuth2)
7. **Admin Dashboard** - Quản lý sản phẩm và đơn hàng

## 🔧 Troubleshooting

### Backend không khởi động được
- Kiểm tra MySQL đã chạy: `docker ps`
- Kiểm tra file `.env` trong thư mục Backend
- Xem log lỗi trong terminal Backend

### Frontend không hiển thị
- Kiểm tra Backend đã chạy chưa
- Xóa `.next` folder và chạy lại: `rm -rf .next; npm run dev`
- Kiểm tra file `.env` trong thư mục Frontend

### Port đã được sử dụng
```powershell
# Tìm process đang dùng port 3000 hoặc 8000
Get-NetTCPConnection -LocalPort 3000,8000 | Select-Object LocalPort, State, OwningProcess

# Kill process (thay PID bằng số thực tế)
Stop-Process -Id <PID> -Force
```

## 📖 API Documentation

Truy cập GraphQL Playground tại http://localhost:8000/graphql để:
- Xem schema của API
- Test các query và mutation
- Đọc documentation tự động

## 🎯 Next Steps

1. Mở http://localhost:3000 trong browser
2. Tạo tài khoản người dùng mới
3. Duyệt các sách trong catalog
4. Test chức năng giỏ hàng và thanh toán (cần cấu hình Stripe)
5. Đăng nhập với admin account để truy cập Admin Dashboard

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra các terminal logs (Backend và Frontend)
2. Xem mục Troubleshooting ở trên
3. Đảm bảo đã cài đặt:
   - Node.js (v18+)
   - Docker Desktop
   - npm hoặc yarn

## 🔄 Cập Nhật Dependencies

Nếu cần cập nhật các package:

```powershell
# Backend
cd Backend
npm update

# Frontend  
cd Frontend
npm update
```

---

**Lưu ý**: Đây là môi trường development. Để deploy production, cần thêm các bước bảo mật và tối ưu hóa.
