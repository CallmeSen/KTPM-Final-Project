# Payment Module - System Test Cases

> **Framework**: Manual Testing / E2E Testing (Cypress/Playwright)  
> **Purpose**: End-to-end validation of payment flows across multiple systems (Backend + Stripe + Database + UI)  
> **Environment**: Test Mode (Stripe Test Environment)

---

## Table of Contents

1. [Stripe Connect Account Creation (ST_PAYMENT_8-11)](#stripe-connect-account-creation)
2. [Batch Import Processing (ST_PAYMENT_15-19)](#batch-import-processing)
3. [Stripe ID Synchronization (ST_PAYMENT_20-23)](#stripe-id-synchronization)
4. [Webhook Event Handling (ST_PAYMENT_28-31)](#webhook-event-handling)

---

## Stripe Connect Account Creation

### [BE_Payment-8] ST_PAY_CreateAccount_Success

**Test Case ID**: `ST_PAY_CreateAccount_Success`  
**Objective**: Kiểm thử luồng onboard trọn vẹn - tạo tài khoản kết nối thành công  
**Type**: System Test (Happy Path)  
**Technique**: Stripe Connect Flow

#### Preconditions
- Tài khoản User chưa kết nối Stripe
- User: `Vendor_01`
- Environment: Stripe Test Mode

#### Test Data
```json
{
  "userId": "Vendor_01",
  "accountType": "express",
  "country": "VN"
}
```

#### Test Procedure
1. **Step 1**: User click button "Kết nối thanh toán"
2. **Step 2**: Hệ thống gọi API `createConnectedAccount` và lấy Link Onboarding
3. **Step 3**: Hệ thống redirect user sang Stripe Hosted Onboarding
4. **Step 4**: Tại Stripe: User điền thông tin test (Business name, Bank account, etc.)
5. **Step 5**: User click "Submit" hoàn tất form
6. **Step 6**: Stripe redirect về URL callback của hệ thống (e.g., `/payment/callback`)
7. **Step 7**: Hệ thống nhận `account_id` và `auth_code` từ Stripe
8. **Step 8**: Kiểm tra Database

#### Expected Results
✅ **Step 2**: API trả về `onboarding_url` hợp lệ (bắt đầu với `https://connect.stripe.com/`)  
✅ **Step 3**: Browser redirect đúng trang Stripe Hosted  
✅ **Step 6**: Stripe redirect về đúng callback URL  
✅ **Step 7**: Hệ thống nhận được `auth_code` và log thành công  
✅ **Step 8**: Database:
  - Trường `stripe_account_id` được lưu (e.g., `acct_1234567890`)
  - Trạng thái User: `status = 'Connected'`

#### Pass/Fail Criteria
- **Pass**: Tất cả expected results đều thỏa mãn
- **Fail**: Bất kỳ step nào thất bại hoặc dữ liệu không khớp

---

### [BE_Payment-9] ST_PAY_CreateAccount_Cancel

**Test Case ID**: `ST_PAY_CreateAccount_Cancel`  
**Objective**: Kiểm tra xử lý khi user từ chối/hủy liên kết giữa chừng  
**Type**: System Test (Negative Path)  
**Technique**: Error Handling

#### Preconditions
- User: `Vendor_02`
- User chưa kết nối Stripe

#### Test Procedure
1. User được redirect sang Stripe Onboarding
2. Tại Stripe: User click link **"Return to [Platform]"** hoặc **"Cancel"** thay vì điền form
3. Quan sát phản hồi của hệ thống

#### Expected Results
✅ Stripe redirect về URL failure/return (e.g., `/payment/cancel`)  
✅ Hệ thống hiển thị thông báo: **"Kết nối chưa hoàn tất"**  
✅ Database: **KHÔNG** lưu `stripe_account_id`  
✅ Trạng thái User: Không thay đổi (vẫn là `Pending` hoặc `Not Connected`)

---

### [BE_Payment-10] ST_PAY_CreateAccount_Exists

**Test Case ID**: `ST_PAY_CreateAccount_Exists`  
**Objective**: Xử lý khi tài khoản đã kết nối trước đó (Idempotency)  
**Type**: System Test (State Transition)  
**Technique**: Idempotency Check

#### Preconditions
- **Dependency**: Phải chạy sau test case `[BE_Payment-8]`
- User: `Vendor_01` (đã có `stripe_account_id` từ test trước)

#### Test Procedure
1. Login bằng User `Vendor_01` (đã có `stripe_account_id`)
2. Click lại nút **"Kết nối thanh toán"**
3. Quan sát hành động của hệ thống

#### Expected Results
✅ Hệ thống **KHÔNG** tạo tài khoản mới trên Stripe  
✅ Trả về Link đăng nhập Dashboard (Stripe Express Login Link) thay vì Link Onboarding mới  
✅ User được redirect tới Stripe Dashboard để quản lý tài khoản  
✅ Database: `stripe_account_id` không thay đổi

---

### [BE_Payment-11] ST_PAY_CreateAccount_APIError

**Test Case ID**: `ST_PAY_CreateAccount_APIError`  
**Objective**: Giả lập lỗi kết nối Stripe (External Error)  
**Type**: System Test (Fault Injection)  
**Technique**: Fault Injection

#### Preconditions
- Môi trường Dev/Test
- Có quyền điều chỉnh network hoặc mock Stripe API

#### Test Data
```json
{
  "network": "Offline/Simulated",
  "stripeResponse": "500 Internal Server Error / Timeout"
}
```

#### Test Procedure
1. **Setup**: Ngắt mạng hoặc giả lập Stripe API trả về `500`/`Timeout`
2. User click **"Kết nối thanh toán"**
3. Quan sát phản hồi của hệ thống

#### Expected Results
✅ Hệ thống **KHÔNG** bị Crash  
✅ Hiển thị thông báo thân thiện:  
   > **"Lỗi kết nối đối tác thanh toán, vui lòng thử lại sau"**  
✅ Log hệ thống ghi nhận lỗi chi tiết:
   ```
   [ERROR] Stripe API connection failed: Timeout after 5000ms
   ```
✅ Database: Không có thay đổi (không lưu dữ liệu rác)

---

## Batch Import Processing

### [BE_Payment-15] ST_PAYMENT_Import_Success

**Test Case ID**: `ST_PAYMENT_Import_Success`  
**Objective**: Kiểm thử Import lô dữ liệu chuẩn (Happy Path)  
**Type**: System Test (Batch Processing - Small batch)

#### Test Data
```
File: valid_products_50.csv
Content: 50 sản phẩm hợp lệ (Name, Price, Currency, Description)
```

#### Test Procedure
1. Chuẩn bị file CSV chứa 50 sản phẩm hợp lệ
2. Upload file vào hệ thống qua UI/API
3. Đợi hệ thống xử lý (progress bar/notification)
4. Check Database: Truy vấn bảng `Products` đếm số lượng

#### Expected Results
✅ Thông báo: **"Import thành công 50/50 bản ghi"**  
✅ Database: Xuất hiện đúng **50 bản ghi mới** với dữ liệu chính xác  
✅ Log hệ thống:
   ```
   [INFO] Import started: file=valid_products_50.csv, rows=50
   [INFO] Import completed: success=50, failed=0, duration=1.2s
   ```

---

### [BE_Payment-16] ST_PAYMENT_Import_MaxLoad

**Test Case ID**: `ST_PAYMENT_Import_MaxLoad`  
**Objective**: Kiểm thử chịu tải dữ liệu lớn (Volume Test)  
**Type**: System Test (Load Testing)  
**Technique**: Batch Processing (Large batch)

#### Preconditions
- Server cấu hình đủ tài nguyên (RAM ≥ 4GB, CPU ≥ 2 cores)

#### Test Data
```
File: max_load_10k.csv
Content: 10,000 dòng sản phẩm hợp lệ
```

#### Test Procedure
1. Chuẩn bị file chứa **10,000 dòng**
2. Upload file
3. **Theo dõi tài nguyên server** (RAM/CPU) trong quá trình xử lý
4. Check Database sau khi hoàn tất

#### Expected Results
✅ Hệ thống **KHÔNG** bị Timeout (504 Gateway Time-out)  
✅ Thời gian xử lý nằm trong ngưỡng cho phép: **< 30 giây**  
✅ Database: Lưu đủ **10,000 bản ghi**, không bị mất mát dữ liệu  
✅ RAM Usage: < 80% capacity  
✅ CPU Usage: < 90% trong quá trình import

---

### [BE_Payment-17] ST_PAYMENT_Import_PartialFail

**Test Case ID**: `ST_PAYMENT_Import_PartialFail`  
**Objective**: Kiểm thử xử lý lỗi một phần (Partial Success)  
**Type**: System Test (Validation)  
**Technique**: Batch Processing with Error Handling

#### Test Data
```
File: mixed_data_100.csv
Content:
  - 90 dòng đúng format
  - 10 dòng sai format (thiếu giá trị, sai kiểu dữ liệu)
```

#### Test Procedure
1. Upload file chứa 100 dòng (90 đúng, 10 sai)
2. Đợi hệ thống xử lý
3. Check Database
4. Tải về File báo lỗi (Error Report)

#### Expected Results
✅ Thông báo: **"Thành công 90, Thất bại 10"**  
✅ Database: Chỉ lưu **90 bản ghi đúng**  
✅ Hệ thống xuất **file log/excel chi tiết 10 dòng lỗi** để user sửa:
   ```csv
   Row,Error,Field,Value
   15,Missing required field,price,NULL
   27,Invalid data type,currency,XYZ123
   ...
   ```

---

### [BE_Payment-18] ST_PAYMENT_Import_Rollback

**Test Case ID**: `ST_PAYMENT_Import_Rollback`  
**Objective**: Kiểm thử tính toàn vẹn (Transaction Rollback)  
**Type**: System Test (Gray-box Testing)  
**Technique**: Simulate Crash/DB Error

#### Preconditions
- Cần quyền truy cập Server/DB để giả lập lỗi

#### Test Data
```
File: transaction_test.csv
Content: 1000 dòng hợp lệ
```

#### Test Procedure
1. Upload file 1000 dòng
2. **Giả lập ngắt kết nối DB hoặc Stop Service ở dòng thứ 500**
3. Khởi động lại và Check DB

#### Expected Results
✅ Hệ thống thực hiện **Rollback** (tùy nghiệp vụ):
   - **Option 1**: Xóa 500 dòng đã lưu (Full Rollback)
   - **Option 2**: Đánh dấu batch `status = 'failed'` (Partial Commit với flag)  
✅ Đảm bảo **KHÔNG** có dữ liệu "rác" (corrupted data) trong DB  
✅ Log ghi nhận:
   ```
   [ERROR] Import interrupted at row 500: Connection lost
   [INFO] Rollback completed: 500 records removed
   ```

---

### [BE_Payment-19] ST_PAYMENT_Import_Duplicate

**Test Case ID**: `ST_PAYMENT_Import_Duplicate`  
**Objective**: Kiểm thử trùng lặp dữ liệu (Idempotency)  
**Type**: System Test (Batch Processing Logic)

#### Preconditions
- **Dependency**: Test case `[BE_Payment-15]` đã chạy xong

#### Test Data
```
File: valid_products_50.csv (same file used in BE_Payment-15)
```

#### Test Procedure
1. Upload lại file `valid_products_50.csv` (đã import ở test trước)
2. Thực hiện Upload lần 2
3. Check DB: Đếm số lượng sản phẩm

#### Expected Results
✅ Hệ thống phát hiện trùng mã (SKU/Product Code)  
✅ Hành động (tùy logic nghiệp vụ):
   - **Update Mode**: Cập nhật thông tin mới (Update existing records)
   - **Skip Mode**: Bỏ qua (Skip duplicates)  
✅ **KHÔNG** tạo ra bản ghi nhân bản (Duplicate records)  
✅ Thông báo: **"50 sản phẩm đã tồn tại: 50 cập nhật / 0 tạo mới"**

---

## Stripe ID Synchronization

### [BE_Payment-20] ST_PAYMENT_UpdateStripeIds_Forward

**Test Case ID**: `ST_PAYMENT_UpdateStripeIds_Forward`  
**Objective**: Đồng bộ xuôi - Cập nhật Stripe ID từ Local lên Server  
**Type**: System Test (Data Sync)  
**Technique**: Local trigger

#### Preconditions
- User phải tồn tại và Active
- User chưa có Stripe Customer ID

#### Test Data
```json
{
  "userId": 101,
  "stripeCustomerId": "cus_123"
}
```

#### Test Procedure
1. Tạo User mới trong DB (chưa có `stripe_customer_id`)
2. Thực hiện hành động thanh toán/add card để sinh `cus_ID` từ Stripe
3. Gọi hàm `updateStripeIds` để lưu `cus_ID` vào DB
4. Query DB bảng `Users`

#### Expected Results
✅ Hàm trả về thành công (HTTP 200)  
✅ Database: Cột `stripe_customer_id` được cập nhật đúng giá trị `cus_123`  
✅ Stripe Dashboard: User được ghi nhận metadata khớp với Local User ID:
   ```json
   {
     "metadata": {
       "local_user_id": "101"
     }
   }
   ```

---

### [BE_Payment-21] ST_PAYMENT_UpdateStripeIds_Backward

**Test Case ID**: `ST_PAYMENT_UpdateStripeIds_Backward`  
**Objective**: Đồng bộ ngược - Xử lý Webhook/Callback từ Stripe  
**Type**: System Test (Event Driven)  
**Technique**: Webhook Testing

#### Preconditions
- Cấu hình Webhook endpoint: `/api/payment/webhook`
- Stripe Webhook Secret đã được thiết lập

#### Test Data
```json
{
  "event": "customer.updated",
  "data": {
    "object": {
      "id": "cus_123",
      "email": "updated@example.com",
      "metadata": {
        "local_user_id": "101"
      }
    }
  }
}
```

#### Test Procedure
1. Giả lập sự kiện từ Stripe (User update info trên cổng thanh toán)
2. Server nhận Webhook chứa `stripe_id` mới hoặc thay đổi trạng thái
3. Hệ thống tự động gọi `updateStripeIds`
4. Kiểm tra Log và DB

#### Expected Results
✅ Server nhận Webhook: Trả về **200 OK** (Để Stripe không retry)  
✅ Log ghi nhận:
   ```
   [INFO] Webhook received: event=customer.updated, customer=cus_123
   [INFO] Sync data success: User ID 101 updated
   ```
✅ Database: Thông tin thanh toán của User được đồng bộ theo Stripe (email cập nhật)

---

### [BE_Payment-22] ST_PAYMENT_UpdateStripeIds_Conflict

**Test Case ID**: `ST_PAYMENT_UpdateStripeIds_Conflict`  
**Objective**: Xử lý xung đột dữ liệu (Data Consistency)  
**Type**: System Test (Validation)

#### Preconditions
- User A đang có `stripe_id = cus_A`

#### Test Data
```json
{
  "userId": "UserA",
  "newStripeId": "cus_B"  // ID của User khác
}
```

#### Test Procedure
1. User A đang có `stripe_id = cus_A`
2. Gọi hàm update với `stripe_id = cus_B` (của User khác hoặc không tồn tại)
3. Kiểm tra cơ chế validate

#### Expected Results
✅ Hệ thống phát hiện bất thường:
   - **Nếu logic cho phép thay thế**: Update và log warning
   - **Nếu ID thuộc user khác**: Báo lỗi **"Duplicate/Conflict"**  
✅ Dữ liệu cũ không bị hỏng (Rollback nếu lỗi)  
✅ Log:
   ```
   [WARNING] Stripe ID conflict: cus_B already belongs to UserB
   ```

---

### [BE_Payment-23] ST_PAYMENT_UpdateStripeIds_Null

**Test Case ID**: `ST_PAYMENT_UpdateStripeIds_Null`  
**Objective**: Kiểm thử trường hợp ngắt kết nối (Unlink)  
**Type**: System Test (Null Checking)

#### Preconditions
- User đang có Stripe ID

#### Test Data
```json
{
  "userId": 101,
  "stripeCustomerId": null
}
```

#### Test Procedure
1. User hủy liên kết thanh toán
2. Gọi hàm `updateStripeIds` với giá trị `null` hoặc rỗng
3. Kiểm tra DB

#### Expected Results
✅ API trả về thành công (HTTP 200)  
✅ Database: Cột `stripe_customer_id` trở về **NULL**  
✅ Stripe Dashboard: Không còn liên kết metadata với User (hoặc metadata bị xóa)

---

## Webhook Event Handling

### [BE_Payment-28] ST_PAYMENT_Webhook_Success

**Test Case ID**: `ST_PAYMENT_Webhook_Success`  
**Objective**: Xử lý sự kiện thanh toán thành công  
**Type**: System Test (Gray-box)  
**Technique**: Event-driven Testing

#### Preconditions
- Order `ORD_123` phải đang ở trạng thái `PENDING`

#### Test Data
```json
{
  "status": "SUCCESS",
  "order_id": "ORD_123",
  "signature": "valid_signature_hash"
}
```

#### Test Procedure
1. **Trigger**: Giả lập Request POST từ Gateway với payload hợp lệ + Signature đúng
2. **Check API**: Kiểm tra phản hồi HTTP ngay lập tức
3. **Check DB (Async)**: Chờ 2-5s, query DB xem trạng thái đơn `ORD_123`

#### Expected Results
✅ API: Trả về **200 OK** (Để Gateway không gửi lại)  
✅ Database: Trạng thái Order chuyển từ `PENDING` → `PAID`  
✅ System: Trigger gửi email xác nhận thanh toán tới user  
✅ Log:
   ```
   [INFO] Webhook success: order_id=ORD_123, status=PAID
   [INFO] Email sent to user@example.com
   ```

---

### [BE_Payment-29] ST_PAYMENT_Webhook_InvalidSignature

**Test Case ID**: `ST_PAYMENT_Webhook_InvalidSignature`  
**Objective**: Kiểm thử bảo mật (Fake Request)  
**Type**: System Test (Security)  
**Technique**: Validate Signature (Chữ ký số)

#### Preconditions
- Order tồn tại và đang `PENDING`

#### Test Data
```json
{
  "status": "SUCCESS",
  "order_id": "ORD_123",
  "signature": "Fake_Sig_123"  // Sai signature
}
```

#### Test Procedure
1. Gửi Request giống hệt `[BE_Payment-28]` nhưng sửa đổi 1 ký tự trong signature
2. Check API: Quan sát phản hồi
3. Check DB: Kiểm tra trạng thái đơn hàng

#### Expected Results
✅ API: Trả về **401 Unauthorized** hoặc **403 Forbidden**  
✅ Database: Trạng thái đơn hàng **KHÔNG** đổi (Vẫn là `PENDING`)  
✅ Log: Hệ thống ghi log cảnh báo tấn công giả mạo:
   ```
   [SECURITY] Invalid webhook signature: order_id=ORD_123, ip=192.168.1.100
   ```

---

### [BE_Payment-30] ST_PAYMENT_Webhook_Duplicate

**Test Case ID**: `ST_PAYMENT_Webhook_Duplicate`  
**Objective**: Kiểm thử xử lý trùng lặp (Idempotency)  
**Type**: System Test (Event Replay)

#### Test Data
```json
{
  "status": "SUCCESS",
  "order_id": "ORD_456",
  "signature": "valid_signature",
  "idempotency_key": "webhook_12345"
}
```

#### Test Procedure
1. **Lần 1**: Gửi Webhook thành công cho `ORD_456`
2. **Lần 2**: Gửi lại y chang Request đó (Simulate Gateway retry)
3. Check DB: Kiểm tra lịch sử giao dịch

#### Expected Results
✅ **Lần 1**: Xử lý thành công, DB update, trả về **200 OK**  
✅ **Lần 2**: API vẫn trả về **200 OK** (để báo Gateway đã nhận rồi),  
   nhưng **KHÔNG** thực hiện logic update lần nữa  
✅ Database: Chỉ có **1 record giao dịch** (không bị trùng lặp)  
✅ Log:
   ```
   [INFO] Webhook duplicate detected: idempotency_key=webhook_12345, skipped
   ```

---

### [BE_Payment-31] ST_PAYMENT_Webhook_Failed

**Test Case ID**: `ST_PAYMENT_Webhook_Failed`  
**Objective**: Xử lý sự kiện thanh toán thất bại  
**Type**: System Test

#### Preconditions
- Order đang `PENDING`

#### Test Data
```json
{
  "status": "FAILED",
  "reason": "Insufficient funds",
  "order_id": "ORD_789"
}
```

#### Test Procedure
1. Trigger: Giả lập Request từ Gateway với payload `status = FAILED`
2. Check API: Kiểm tra phản hồi
3. Check DB: Kiểm tra trạng thái đơn hàng

#### Expected Results
✅ API: Trả về **200 OK** (Đã nhận tin)  
✅ Database: Trạng thái Order chuyển thành `CANCELED` hoặc `FAILED`  
✅ UI/Notif: Gửi thông báo nhắc nhở user thanh toán lại:
   > **"Thanh toán thất bại: Số dư không đủ. Vui lòng thử lại."**

---

## Test Execution Notes

### Environment Setup
- **Stripe**: Use Stripe Test Mode with test API keys
- **Database**: Use separate test database (auto-reset before each test suite)
- **Network**: Use tools like `Postman`, `ngrok` for webhook testing

### Tools Recommended
- **E2E Testing**: Cypress / Playwright
- **API Testing**: Postman / Newman / REST Client
- **Webhook Testing**: Stripe CLI (`stripe listen --forward-to localhost:3000/webhook`)
- **Database**: pgAdmin / MySQL Workbench

### Execution Order
1. Run Integration Tests first (`payment.it.spec.ts`)
2. Then run System Tests manually or via E2E framework
3. Verify logs and database state after each test

---

## Summary

| Category | Total Tests |
|----------|-------------|
| Stripe Connect Account | 4 |
| Batch Import Processing | 5 |
| Stripe ID Synchronization | 4 |
| Webhook Event Handling | 4 |
| **TOTAL** | **17** |

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Author**: QA Automation Engineer
