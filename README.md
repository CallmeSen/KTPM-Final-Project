# Ứng Dụng Quản Lý Thư Viện/Cửa Hàng Sách (NestJS + Next.js)

Hệ thống quản lý thư viện/cửa hàng sách - Ứng dụng full-stack được thiết kế cho khách hàng, nhân viên và quản trị viên nhằm tối ưu hóa hoạt động mua bán và quản lý sách.

### Instructor
*[TS. Đỗ Như Tài](https://github.com/dntai)*

## Tổng Quan
Dự án Quản Lý Thư Viện/Cửa Hàng Sách là một giải pháp phần mềm full-stack hiện đại, được phát triển để nâng cao và đơn giản hóa quy trình quản lý cửa hàng sách. Xây dựng bằng NestJS (Backend) và Next.js (Frontend), tích hợp MySQL/PostgreSQL qua TypeORM, ứng dụng này mang đến giao diện thân thiện và API mạnh mẽ (GraphQL + REST) cho việc quản lý các khía cạnh khác nhau của doanh nghiệp sách.

## Tính Năng

### 1. Xác Thực và Phân Quyền
- Chức năng đăng nhập/đăng ký an toàn với JWT Authentication.
- Hỗ trợ Google OAuth 2.0 để đăng nhập nhanh.
- Phân quyền truy cập theo vai trò (USER/ADMIN) để đảm bảo mức độ ủy quyền phù hợp.
- Quản lý Refresh Token và Blacklist Token để bảo mật cao.

### 2. Quản Lý Sách
- Thêm, sửa hoặc xóa các sản phẩm sách khỏi kho (Admin).
- Tìm kiếm, lọc và phân loại sách theo thể loại, tác giả, giá.
- Theo dõi mức tồn kho thông qua module Inventory.
- Hỗ trợ import dữ liệu sách từ file CSV.
- Hiển thị thông tin chi tiết sách với hình ảnh, mô tả, đánh giá.

### 3. Quản Lý Giỏ Hàng và Đơn Hàng
- Quản lý giỏ hàng của khách hàng (thêm, xóa, cập nhật số lượng).
- Xử lý đơn hàng hiệu quả với tích hợp thanh toán Stripe.
- Lưu trữ lịch sử giao dịch và đơn hàng của khách hàng.

### 4. Quản Lý Người Dùng
- Thêm, cập nhật và quản lý hồ sơ người dùng.
- Quản lý trạng thái tài khoản (Active/Inactive).
- Xem lịch sử mua hàng và hoạt động của người dùng.

### 5. Bình Luận và Đánh Giá
- Khách hàng có thể để lại bình luận và đánh giá cho sách.
- Hệ thống bình luận có cấu trúc reply (trả lời bình luận).
- Quản lý và kiểm duyệt bình luận (Admin).

### 6. Thông Báo Real-time
- Hệ thống thông báo tự động cho người dùng.
- WebSocket/Socket.IO để cập nhật thông báo theo thời gian thực.
- Quản lý và đánh dấu thông báo đã đọc/chưa đọc.

### 7. Thanh Toán
- Tích hợp Stripe để xử lý thanh toán trực tuyến an toàn.
- Hỗ trợ webhook để xác nhận thanh toán.
- Tạo và lưu trữ lịch sử thanh toán.

### 8. Tìm Kiếm và Lịch Sử
- Tìm kiếm sách thông minh với autocomplete.
- Lưu lịch sử tìm kiếm của người dùng.
- Cache kết quả tìm kiếm để tăng hiệu suất.

### 9. Email Notifications
- Gửi email xác nhận đăng ký, reset password.
- Template email với Handlebars.
- Tích hợp Nodemailer để gửi email.

## Công Nghệ 🔧

### Backend
- **Framework:** NestJS (Node.js)
- **Ngôn Ngữ:** TypeScript
- **API:** GraphQL (Apollo Server) + REST API
- **ORM:** TypeORM
- **Cơ Sở Dữ Liệu:** MySQL
- **Authentication:** JWT, Passport.js, Google OAuth 2.0
- **Thanh Toán:** Stripe
- **Email:** Nodemailer + Handlebars
- **Real-time:** Socket.IO
- **Cache:** Cache Manager
- **Security:** Throttler (Rate Limiting), Helmet

### Frontend
- **Framework:** Next.js 14+ (React)
- **Ngôn Ngữ:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **UI Components:** Radix UI, Shadcn/ui
- **HTTP Client:** Axios, Apollo Client (GraphQL)
- **Forms:** React Hook Form

### DevOps
- **Containerization:** Docker Compose
- **Quản Lý Phiên Bản:** Git, GitHub, Github Action
- **IDE:** Visual Studio Code

## Hướng Dẫn Cài Đặt ✔️

Trước khi bắt đầu, hãy đảm bảo rằng các yêu cầu sau đã được cài đặt:

- [Node.js](https://nodejs.org/) (LTS version, >=16.x)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - Môi trường ảo
- [Git](https://git-scm.com/)

### Cài MySQL/ trên Docker:

**Option 1: MySQL**

1. Tải image MySQL:

   ```bash
   docker pull mysql:8.0
   ```

2. Tạo container MySQL:

   ```bash
   docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=Thanhtuan@123 -e MYSQL_DATABASE=bookstore -p 3306:3306 -d mysql:8.0
   ```

3. Kiểm tra container đang chạy:

   ```bash
   docker ps
   ```

4. Kết nối MySQL:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** `Thanhtuan@123`
   - **Database:** `bookstore`

### Cài Đặt Ứng Dụng:

1. Clone repository:

   ```bash
   # Sử dụng HTTPS
   git clone https://github.com/CallmeSen/KTPM-Final-Project.git

   # Sử dụng SSH
   git clone git@github.com:CallmeSen/KTPM-Final-Project.git
   ```

2. Cài đặt dependencies cho Backend:

   ```bash
   cd KTPM-Final-Project/backend
   npm install
   ```

3. Cấu hình file `.env` cho Backend:

   Tạo file `.env` trong thư mục `backend/` với nội dung:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=Thanhtuan@123
   DB_NAME=bookstore

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-key-here
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

   # Email Configuration
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_FROM=noreply@bookstore.com

   # Application
   PORT=3000
   NODE_ENV=development
   ```

4. Chạy Backend:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

   Backend sẽ chạy tại `http://localhost:3000`

5. Cài đặt dependencies cho Frontend:

   ```bash
   cd ../Frontend
   npm install
   ```

6. Cấu hình file `.env.local` cho Frontend:

   Tạo file `.env.local` trong thư mục `Frontend/` với nội dung:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

7. Chạy Frontend:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

   Frontend sẽ chạy tại `http://localhost:3001`

### Sử Dụng Docker Compose (Recommended):

1. Từ thư mục root của project:

   ```bash
   docker-compose up --build
   ```

2. Dừng containers:

   ```bash
   docker-compose down
   ```

## Cấu Trúc Thư Mục 📁

```
KTPM-Final-Project/
├── backend/                           # NestJS Backend
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   ├── schema.gql                # GraphQL schema
│   │   ├── config/
│   │   │   └── db.config.ts          # Database configuration
│   │   ├── modules/
│   │   │   ├── auth/                 # Authentication module
│   │   │   │   ├── guards/           # JWT & Role guards
│   │   │   │   ├── strategies/       # Passport strategies
│   │   │   │   └── entities/         # RefreshToken, Blacklist
│   │   │   ├── users/                # User management
│   │   │   ├── books/                # Book management
│   │   │   │   └── mockData/         # CSV import data
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── Payment/              # Stripe integration
│   │   │   ├── comment/              # Comments & reviews
│   │   │   ├── notification/         # Notifications
│   │   │   ├── inventory/            # Stock management
│   │   │   └── Blacklist/            # Token blacklist
│   │   ├── mails/                    # Email templates
│   │   ├── decorator/                # Custom decorators
│   │   ├── enum/                     # Enums (Roles, etc.)
│   │   ├── entities/                 # Shared entities
│   │   ├── helpers/                  # Utility functions
│   │   ├── interceptors/             # Cache interceptor
│   │   └── middleware/               # Logging middleware
│   ├── package.json
│   ├── tsconfig.json
│   └── dockerfile
│
├── Frontend/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App router pages
│   │   ├── components/               # React components
│   │   ├── lib/                      # API clients, utilities
│   │   ├── context/                  # React Context
│   │   ├── hooks/                    # Custom hooks
│   │   └── Shared/                   # Shared constants
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── dockerfile
│
├── Machine-Learning-Sentimental-Classfication/  # ML model
│   └── analyze-sentimental-review.ipynb
│
├── docker-compose.yml                # Docker orchestration
└── README.md
```

## API Endpoints Chính 🔌

### REST API

- **Authentication**
  - `POST /auth/register` - Đăng ký tài khoản
  - `POST /auth/login` - Đăng nhập
  - `POST /auth/refresh` - Refresh token
  - `POST /auth/logout` - Đăng xuất
  - `GET /auth/google` - Google OAuth login

- **Payment**
  - `POST /payment/create-checkout-session` - Tạo phiên thanh toán
  - `POST /payment/webhook` - Stripe webhook

### GraphQL API

Truy cập GraphQL Playground tại `http://localhost:3000/graphql`

**Queries:**
```graphql
# Lấy danh sách sách
query {
  books {
    id
    title
    author
    price
    stock
  }
}

# Lấy giỏ hàng
query {
  cart {
    id
    totalPrice
    items {
      book {
        title
        price
      }
      quantity
    }
  }
}

# Lấy thông báo
query {
  notifications {
    id
    title
    message
    read
    createdAt
  }
}
```

**Mutations:**
```graphql
# Thêm sách vào giỏ
mutation {
  addToCart(bookId: "uuid", quantity: 1) {
    id
    totalPrice
  }
}

# Tạo bình luận
mutation {
  createComment(input: {
    bookId: "uuid"
    content: "Great book!"
    rating: 5
  }) {
    id
    content
    createdAt
  }
}
```

## Testing 🧪

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd Frontend

# Run tests
npm run test

# Test with coverage
npm run test:coverage
```

## Deployment 🚀

### Backend Deployment

1. Build production:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. Build production:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Tài Khoản Demo 👤

Sau khi chạy seeder hoặc import dữ liệu mẫu:

- **Admin:**
  - Email: `admin@bookstore.com`
  - Password: `Admin@123`

- **User:**
  - Email: `user@bookstore.com`
  - Password: `User@123`

## Troubleshooting 🔧

### Lỗi kết nối Database

- Kiểm tra Docker container có đang chạy không: `docker ps`
- Kiểm tra thông tin kết nối trong file `.env`
- Restart container: `docker restart mysql-db` hoặc `docker restart postgres-db`

### Lỗi TypeScript Decorator

- Xóa folder `dist` và `node_modules/.cache`
- Chạy lại `npm install`
- Restart TypeScript server trong VS Code

### Lỗi Port đã được sử dụng

- Thay đổi port trong file `.env` và `main.ts`
- Hoặc kill process đang sử dụng port: 
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## Ảnh Màn Hình 📸

## License 📄

This project is licensed under the MIT License.

## Về Nhóm Dự Án 🤝

- **Members:** *[Huỳnh Thanh Tuấn](https://github.com/CallmeSen)*
- **Members:** *[Lâm Quang Khôi](https://github.com/kohi-vip)*
- **Members:** *[Nguyễn Trọng Nghĩa](https://github.com/nghia108)*
- **Members:** *[Nguyen Huynh Phuong Loc](https://github.com/nguyenhuynhphuongloc)*

---

**Note:** Đây là project học tập.
