# KTPM-Final-Project

A simple library/bookstore full-stack project (Backend: NestJS, Frontend: Next.js). Dự án bao gồm API (GraphQL/REST), database models (TypeORM), authentication (JWT) và giao diện Next.js.

## Tổng quan

Ứng dụng là một demo hệ thống quản lý sách và mua hàng: quản lý sách, giỏ hàng, nhận xét, thông báo, thanh toán, và chức năng admin. Mục tiêu repo là làm ví dụ triển khai NestJS + Next.js với các cơ chế thực tiễn: DTO validation, role-based access control, TypeORM entities, và template mail.

## Cấu trúc chính (tóm tắt)

KTPM-Final-Project/
│   ├── LICENSE
│   ├── README.md
│   ├── .gitignore
│   ├── backend/                       # NestJS server
│   │   ├── dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── nest-cli.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── schema.gql             # GraphQL types & inputs
│   │   │   ├── config/db.config.ts
│   │   │   ├── decorator/
│   │   │   │   ├── role.ts            # Roles decorator
│   │   │   │   └── custome.ts         # Public() decorator
│   │   │   ├── enum/role.ts           # ROLE enum (USER / ADMIN)
│   │   │   ├── entities/
│   │   │   │   └── search-history.ts  # TypeORM entity example
│   │   │   ├── modules/               # feature modules (auth, books, users, ...)
│   │   │   │   ├── auth/
│   │   │   │   │   └── guards/
│   │   │   │   │       ├── jwt.guard.ts
│   │   │   │   │       └── role.guard.ts
│   │   │   │   └── books/              # mockData CSVs inside books/mockData
│   │   └── test/                      # e2e tests
│   ├── Frontend/                      # Next.js app (TypeScript + Tailwind)
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── public/                     # images & assets
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── lib/                    # api clients, auth helpers
│   │       └── context/
│   └── design/                        # mockup / images

## Yêu cầu (Requirements)

- Node.js (LTS, ví dụ >=16)
- npm hoặc yarn
- (Tuỳ môi trường) PostgreSQL hoặc DB tương thích mà project cấu hình

## Cài đặt nhanh (dev)

1. Backend

```powershell
cd backend
npm install
npm run start:dev
```

2. Frontend

```powershell
cd Frontend
npm install
npm run dev
```

3. (Tuỳ) Chạy docker-compose

```powershell
# Từ root repo
docker-compose up --build
```

## Biến môi trường quan trọng

Tùy cấu hình thực tế (có thể có file `.env.example` trong `backend`):

- DATABASE_URL hoặc DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- JWT_SECRET
- STRIPE_SECRET_KEY (nếu dùng thanh toán)
- MAIL_HOST, MAIL_USER, MAIL_PASSWORD (nếu gửi email)

Đặt file `.env` ở thư mục `backend/` trước khi khởi động server.

## Chạy test

- Backend unit / e2e

```powershell
cd backend
npm run test
npm run test:e2e
```

- Frontend (nếu có)

```powershell
cd Frontend
npm run test
```
