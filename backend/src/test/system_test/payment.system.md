# Payment Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Payment Module in standardized table format, focusing on Stripe Connect Integration, Batch Processing, Data Synchronization, and Webhook Security.

**Module:** Payment (Stripe Integration & Transaction Processing)  
**Test Type:** System Test / E2E  
**Framework:** Manual Testing / Cypress / Playwright  
**Environment:** Stripe Test Mode  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// Stripe Test Mode Configuration
STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY
STRIPE_TEST_PUBLIC_KEY: process.env.STRIPE_TEST_PUBLIC_KEY
STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID

// Backend API
BACKEND_URL: 'http://localhost:4000'
WEBHOOK_ENDPOINT: 'http://localhost:4000/api/payment/webhook'
```

### Test Prerequisites
- Stripe Test Account (https://dashboard.stripe.com/test/)
- Stripe CLI installed (`stripe listen --forward-to localhost:4000/webhook`)
- PostgreSQL/MySQL database for order/user data
- Test CSV files for batch import scenarios

---

## System Test Cases

### Section 1: Stripe Connect Account Creation

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_PAY_CONNECT_01 | Stripe Connect Onboarding Success | Kiểm thử luồng kết nối tài khoản Stripe thành công (Happy Path) | 1. **User Action**: User login as `Vendor_01`, click "Kết nối thanh toán"<br>2. **API Call**: Backend gọi API `createConnectedAccount` với `accountType = 'express'`, `country = 'VN'`<br>3. **Redirect**: System redirect user sang Stripe Hosted Onboarding URL<br>4. **Fill Form**: Tại Stripe, user điền:<br>   - Business name: "Test Vendor 01"<br>   - Bank account: Test account (routing: 110000000, account: 000123456789)<br>   - Email: vendor01@test.com<br>5. **Submit**: Click "Submit" hoàn tất onboarding<br>6. **Callback**: Stripe redirect về `/payment/callback?auth_code=ac_xyz&account_id=acct_123`<br>7. **Check DB**: Query `SELECT stripe_account_id, status FROM users WHERE id = 'Vendor_01'` | 1. **API Response**: `{ "onboarding_url": "https://connect.stripe.com/setup/..." }` (200 OK)<br>2. **Redirect**: Browser navigate đúng sang Stripe Hosted page<br>3. **Callback**: Backend nhận `auth_code` và `account_id` từ Stripe<br>4. **Database**:<br>   - `stripe_account_id = 'acct_123'`<br>   - `status = 'Connected'`<br>5. **UI**: Display "Kết nối thành công" notification | None | User: `Vendor_01`<br>Account Type: express<br>Country: VN<br>Stripe Test Bank:<br>  - Routing: 110000000<br>  - Account: 000123456789 | | | Related: [BE_Payment-8]<br>Priority: P0 |
| SYSTEM_PAY_CONNECT_02 | User Cancels Onboarding | Kiểm tra xử lý khi user hủy/từ chối kết nối Stripe | 1. **Setup**: User `Vendor_02` chưa kết nối Stripe<br>2. **Start**: Click "Kết nối thanh toán" → Redirect to Stripe<br>3. **Cancel**: Tại Stripe Onboarding page, user click "Return to [Platform]" hoặc close tab<br>4. **Return**: Stripe redirect về `/payment/cancel`<br>5. **Check DB**: Query `SELECT stripe_account_id, status FROM users WHERE id = 'Vendor_02'` | 1. **Redirect**: System navigate đúng sang `/payment/cancel` URL<br>2. **UI**: Hiển thị message "Kết nối chưa hoàn tất. Bạn có thể thử lại bất cứ lúc nào."<br>3. **Database**:<br>   - `stripe_account_id = NULL` (không lưu)<br>   - `status = 'Not Connected'` (unchanged)<br>4. **No Errors**: Application không crash hoặc báo lỗi hệ thống | None | User: `Vendor_02`<br>Expected: Graceful cancellation | | | Related: [BE_Payment-9]<br>Negative Path |
| SYSTEM_PAY_CONNECT_03 | Reconnect Existing Account | Xử lý khi user đã kết nối trước đó (Idempotency) | 1. **Precondition**: Vendor_01 đã có `stripe_account_id = 'acct_123'` (từ SYSTEM_PAY_CONNECT_01)<br>2. **User Action**: Login as Vendor_01, click lại "Kết nối thanh toán"<br>3. **Check Response**: Observe API behavior<br>4. **Expected Redirect**: System should provide login link instead of new onboarding | 1. **API Response**: `{ "dashboard_url": "https://connect.stripe.com/express_login/..." }` (NOT new onboarding URL)<br>2. **Redirect**: User navigate to Stripe Express Dashboard (not onboarding form)<br>3. **Database**: `stripe_account_id` remains unchanged (`acct_123`)<br>4. **No Duplicate**: Stripe account NOT duplicated | SYSTEM_PAY_CONNECT_01 (must run first) | User: `Vendor_01`<br>Existing Account: acct_123<br>Expected: Login link | | | Related: [BE_Payment-10]<br>Idempotency critical |
| SYSTEM_PAY_CONNECT_04 | Stripe API Connection Error | Giả lập lỗi kết nối Stripe API (Fault Injection) | 1. **Setup**: Mock/Stub Stripe API to return `500 Internal Server Error` or timeout<br>   - Method 1: Disconnect network<br>   - Method 2: Use Stripe CLI with error simulation<br>   - Method 3: Mock API response in test environment<br>2. **User Action**: Click "Kết nối thanh toán"<br>3. **Observe**: Check error handling<br>4. **Check Logs**: Verify error logging | 1. **UI**: Hiển thị thông báo thân thiện: "Lỗi kết nối đối tác thanh toán, vui lòng thử lại sau"<br>2. **No Crash**: Application continues working (not HTTP 500 to user)<br>3. **Logs**: Error logged with details:<br>   `[ERROR] Stripe API connection failed: Timeout after 5000ms`<br>4. **Database**: No corrupted data (no partial writes)<br>5. **Retry**: User can click again without issues | None | Simulated Error: 500 or Timeout<br>Expected: Graceful error handling | | | Related: [BE_Payment-11]<br>Fault Injection |

### Section 2: Batch Import Processing

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_PAY_IMPORT_01 | Import Valid CSV File | Kiểm thử import lô dữ liệu hợp lệ (Happy Path - Small Batch) | 1. **Prepare File**: Create CSV file with 50 valid products:<br>   ```csv<br>   Name,Price,Currency,Description<br>   Product 1,100000,VND,Test product 1<br>   Product 2,200000,VND,Test product 2<br>   ...(50 rows total)<br>   ```<br>2. **Upload**: Navigate to Admin Panel → Import → Select file → Click "Upload"<br>3. **Wait**: Observe progress bar/spinner (1-2 seconds)<br>4. **Check DB**: Query `SELECT COUNT(*) FROM products WHERE created_at > NOW() - INTERVAL '1 minute'` | 1. **UI Notification**: "Import thành công 50/50 bản ghi"<br>2. **Database**: Exactly **50 new records** inserted with correct data<br>3. **Logs**:<br>   ```<br>   [INFO] Import started: file=valid_products_50.csv, rows=50<br>   [INFO] Import completed: success=50, failed=0, duration=1.2s<br>   ```<br>4. **Performance**: Import completes in < 5 seconds | None | File: `valid_products_50.csv`<br>Rows: 50 valid<br>Expected: 100% success | | | Related: [BE_Payment-15]<br>Baseline test |
| SYSTEM_PAY_IMPORT_02 | Import Large Volume | Kiểm thử chịu tải dữ liệu lớn (Load Test - 10K rows) | 1. **Prepare File**: CSV with **10,000 rows** of valid products<br>2. **Monitor Resources**: Open server monitoring tools (htop, Task Manager, etc.)<br>3. **Upload**: Upload file via UI/API<br>4. **Track Progress**: Monitor:<br>   - Import duration<br>   - RAM usage<br>   - CPU usage<br>5. **Check DB**: `SELECT COUNT(*) FROM products WHERE batch_id = :batchId` | 1. **No Timeout**: Request completes successfully (not 504 Gateway Timeout)<br>2. **Duration**: Import completes in < 30 seconds<br>3. **Database**: All **10,000 records** inserted correctly (no data loss)<br>4. **Resource Usage**:<br>   - RAM < 80% of server capacity<br>   - CPU < 90% during import<br>5. **No Memory Leak**: RAM returns to normal after completion | None | File: `max_load_10k.csv`<br>Rows: 10,000<br>Server: ≥4GB RAM, ≥2 cores | | | Related: [BE_Payment-16]<br>Performance critical |
| SYSTEM_PAY_IMPORT_03 | Import Partial Invalid Data | Xử lý lỗi một phần dữ liệu (Partial Failure) | 1. **Prepare Mixed File**: CSV with 100 rows:<br>   - 90 rows: Valid data<br>   - 10 rows: Invalid (missing price, wrong currency format, etc.)<br>   Example invalid rows:<br>   ```csv<br>   Product X,,VND,Desc    # Missing price<br>   Product Y,100,XYZ,Desc # Invalid currency<br>   ```<br>2. **Upload**: Import via UI<br>3. **Wait**: Let system process<br>4. **Download Error Report**: Check exported error file | 1. **UI Message**: "Thành công 90, Thất bại 10"<br>2. **Database**: Only **90 valid records** inserted<br>3. **Error Report**: System exports CSV/Excel with failed rows:<br>   ```csv<br>   Row,Error,Field,Value<br>   15,Missing required field,price,NULL<br>   27,Invalid data type,currency,XYZ<br>   ```<br>4. **User Action**: User can fix 10 rows and re-upload | None | File: `mixed_data_100.csv`<br>Valid: 90<br>Invalid: 10<br>Expected: Partial success | | | Related: [BE_Payment-17]<br>Validation logic |
| SYSTEM_PAY_IMPORT_04 | Transaction Rollback on Crash | Kiểm thử tính toàn vẹn dữ liệu (Database Crash Handling) | 1. **Prepare**: CSV with 1,000 valid rows<br>2. **Start Import**: Upload file<br>3. **Simulate Crash**: At row ~500, simulate database error:<br>   - Docker: `docker stop bookstore_db`<br>   - Network: Disconnect DB connection<br>   - Manual: Kill DB process<br>4. **Restart**: Bring DB back online<br>5. **Check DB**: Query products table and import logs | 1. **Transaction Behavior** (depends on business logic):<br>   - **Option A (Full Rollback)**: All 500 inserted rows removed automatically<br>   - **Option B (Partial Commit)**: Batch marked `status = 'failed'`, but data kept for audit<br>2. **No Corrupted Data**: Database remains consistent (no half-records)<br>3. **Logs**:<br>   ```<br>   [ERROR] Import interrupted at row 500: Connection lost<br>   [INFO] Rollback completed: 500 records removed<br>   ```<br>4. **Recovery**: User can retry import without manual cleanup | None | File: `transaction_test.csv`<br>Rows: 1,000<br>Crash at: row 500 | | | Related: [BE_Payment-18]<br>Critical for data integrity |
| SYSTEM_PAY_IMPORT_05 | Duplicate Data Handling | Kiểm thử idempotency (Re-upload same file) | 1. **Precondition**: Run SYSTEM_PAY_IMPORT_01 first (50 products already imported)<br>2. **Re-upload**: Upload same file `valid_products_50.csv` again<br>3. **Observe**: Check system behavior<br>4. **Check DB**: `SELECT COUNT(*) FROM products WHERE name LIKE 'Product%'` | 1. **Duplicate Detection**: System detects duplicate SKU/Product Code<br>2. **Behavior** (based on business logic):<br>   - **Update Mode**: Updates 50 existing records (latest data wins)<br>   - **Skip Mode**: Skips all 50 duplicates<br>3. **No Duplicate Records**: Database does NOT have duplicate entries<br>4. **UI Message**: "50 sản phẩm đã tồn tại: 50 cập nhật / 0 tạo mới" | SYSTEM_PAY_IMPORT_01 (must run first) | File: `valid_products_50.csv` (same as test 01)<br>Expected: Idempotent behavior | | | Related: [BE_Payment-19]<br>Idempotency critical |

### Section 3: Stripe ID Synchronization

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_PAY_SYNC_01 | Forward Sync - Local to Stripe | Đồng bộ xuôi: Cập nhật Stripe Customer ID từ Local DB lên Server | 1. **Setup**: Create new user in DB without `stripe_customer_id`:<br>   ```sql<br>   INSERT INTO users (id, email, name) VALUES (101, 'user101@test.com', 'Test User 101');<br>   ```<br>2. **Trigger Payment**: User thêm thẻ thanh toán hoặc thực hiện checkout<br>3. **Backend Action**: Stripe creates `cus_123`, backend calls `updateStripeIds(userId=101, stripeCustomerId='cus_123')`<br>4. **Check DB**: `SELECT stripe_customer_id FROM users WHERE id = 101`<br>5. **Check Stripe**: Query Stripe API for customer metadata | 1. **API Response**: `{ "success": true }` (HTTP 200)<br>2. **Database**: `stripe_customer_id = 'cus_123'` (updated correctly)<br>3. **Stripe Dashboard**: Customer `cus_123` has metadata:<br>   ```json<br>   {<br>     "metadata": {<br>       "local_user_id": "101"<br>     }<br>   }<br>   ```<br>4. **Bidirectional Link**: Both systems reference each other | None | User ID: 101<br>Stripe Customer ID: cus_123<br>Expected: Two-way link | | | Related: [BE_Payment-20]<br>Data consistency |
| SYSTEM_PAY_SYNC_02 | Backward Sync - Stripe to Local | Đồng bộ ngược: Xử lý Webhook từ Stripe (Customer Update Event) | 1. **Setup**: Configure webhook endpoint `/api/payment/webhook` with secret<br>2. **Stripe Event**: Simulate `customer.updated` event from Stripe:<br>   ```json<br>   {<br>     "event": "customer.updated",<br>     "data": {<br>       "object": {<br>         "id": "cus_123",<br>         "email": "updated@example.com",<br>         "metadata": { "local_user_id": "101" }<br>       }<br>     }<br>   }<br>   ```<br>3. **Trigger**: Send POST request to webhook endpoint (or use Stripe CLI: `stripe trigger customer.updated`)<br>4. **Check Logs & DB** | 1. **Webhook Response**: Server returns **200 OK** (so Stripe doesn't retry)<br>2. **Logs**:<br>   ```<br>   [INFO] Webhook received: event=customer.updated, customer=cus_123<br>   [INFO] Sync data success: User ID 101 updated<br>   ```<br>3. **Database**: User 101 email updated to `updated@example.com`<br>4. **No Data Loss**: All fields synchronized correctly | None | Event: customer.updated<br>Customer ID: cus_123<br>User ID: 101 | | | Related: [BE_Payment-21]<br>Event-driven sync |
| SYSTEM_PAY_SYNC_03 | Conflict Handling | Xử lý xung đột khi Stripe ID bất thường (Data Validation) | 1. **Setup**: User A có `stripe_customer_id = 'cus_A'`<br>2. **Attempt Update**: Gọi API để update User A với `stripe_customer_id = 'cus_B'` (ID của User khác hoặc invalid ID)<br>3. **Trigger**: `updateStripeIds(userId='UserA', stripeCustomerId='cus_B')`<br>4. **Check Validation**: Observe error handling | 1. **Validation Error**: API returns error:<br>   ```json<br>   {<br>     "error": "Stripe ID conflict",<br>     "message": "cus_B already belongs to UserB"<br>   }<br>   ```<br>2. **Database**: User A's data **unchanged** (rollback on conflict)<br>3. **Logs**:<br>   ```<br>   [WARNING] Stripe ID conflict: cus_B already belongs to UserB<br>   ```<br>4. **No Corruption**: Database integrity maintained | None | User A: cus_A<br>Attempted: cus_B (belongs to User B)<br>Expected: Reject | | | Related: [BE_Payment-22]<br>Data integrity critical |
| SYSTEM_PAY_SYNC_04 | Unlink Stripe Account | Kiểm thử xóa/ngắt kết nối Stripe (Null Value Handling) | 1. **Setup**: User 101 đang có `stripe_customer_id = 'cus_123'`<br>2. **User Action**: User hủy liên kết thanh toán trong settings<br>3. **API Call**: `updateStripeIds(userId=101, stripeCustomerId=null)`<br>4. **Check DB**: Query user data<br>5. **Check Stripe**: Query Stripe API | 1. **API Response**: `{ "success": true }` (HTTP 200)<br>2. **Database**: `stripe_customer_id = NULL` (unlinked)<br>3. **Stripe Dashboard**: Customer metadata cleared or deleted<br>4. **User Status**: Payment status = 'Not Connected' or similar | None | User ID: 101<br>Action: Set stripe_customer_id to NULL<br>Expected: Clean unlink | | | Related: [BE_Payment-23]<br>Null handling |

### Section 4: Webhook Event Handling

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_PAY_WEBHOOK_01 | Payment Success Webhook | Xử lý webhook thanh toán thành công (Happy Path) | 1. **Setup**: Create order `ORD_123` with `status = 'PENDING'`<br>2. **Simulate Webhook**: Send POST to `/api/payment/webhook` with payload:<br>   ```json<br>   {<br>     "status": "SUCCESS",<br>     "order_id": "ORD_123",<br>     "signature": "valid_hmac_sha256_signature"<br>   }<br>   ```<br>   Signature calculated using webhook secret<br>3. **Wait**: Allow async processing (2-5 seconds)<br>4. **Check DB**: `SELECT status FROM orders WHERE id = 'ORD_123'`<br>5. **Check Email**: Verify email sent to user | 1. **API Response**: **200 OK** (immediately, so gateway doesn't retry)<br>2. **Database**: Order status updated from `PENDING` → `PAID`<br>3. **Email Sent**: User receives confirmation email:<br>   Subject: "Đơn hàng ORD_123 đã thanh toán thành công"<br>4. **Logs**:<br>   ```<br>   [INFO] Webhook success: order_id=ORD_123, status=PAID<br>   [INFO] Email sent to user@example.com<br>   ``` | None | Order ID: ORD_123<br>Status: SUCCESS<br>Signature: Valid HMAC | | | Related: [BE_Payment-28]<br>Priority: P0 |
| SYSTEM_PAY_WEBHOOK_02 | Invalid Signature - Security | Kiểm thử bảo mật: Từ chối webhook giả mạo (Security Test) | 1. **Setup**: Order `ORD_123` đang `PENDING`<br>2. **Fake Request**: Send POST with WRONG signature:<br>   ```json<br>   {<br>     "status": "SUCCESS",<br>     "order_id": "ORD_123",<br>     "signature": "FAKE_SIGNATURE_12345"<br>   }<br>   ```<br>3. **Check API Response**: Immediately check HTTP status<br>4. **Check DB**: Verify order status unchanged<br>5. **Check Logs**: Look for security alert | 1. **API Response**: **401 Unauthorized** or **403 Forbidden**<br>2. **Database**: Order status remains `PENDING` (no change)<br>3. **No Processing**: Webhook logic NOT executed (ignored completely)<br>4. **Security Log**:<br>   ```<br>   [SECURITY] Invalid webhook signature: order_id=ORD_123, ip=192.168.1.100<br>   [SECURITY] Potential attack detected: timestamp=2025-12-18T10:30:45Z<br>   ```<br>5. **Alert**: Optionally trigger security monitoring alert | None | Order ID: ORD_123<br>Signature: FAKE (invalid)<br>Expected: Reject completely | | | Related: [BE_Payment-29]<br>Security critical |
| SYSTEM_PAY_WEBHOOK_03 | Duplicate Webhook - Idempotency | Kiểm thử xử lý webhook trùng lặp (Gateway Retry Scenario) | 1. **First Request**: Send valid webhook for `ORD_456`:<br>   ```json<br>   {<br>     "status": "SUCCESS",<br>     "order_id": "ORD_456",<br>     "idempotency_key": "webhook_12345",<br>     "signature": "valid_sig"<br>   }<br>   ```<br>2. **Wait**: Processing completes<br>3. **Second Request**: Send EXACT same webhook (simulate gateway retry)<br>4. **Check DB**: Count payment records for ORD_456 | 1. **First Request**: Processed normally, returns **200 OK**, DB updated<br>2. **Second Request**: Returns **200 OK** (to acknowledge receipt), but **NO duplicate processing**<br>3. **Database**: Only **1 payment record** exists (not duplicated)<br>4. **Logs**:<br>   ```<br>   [INFO] Webhook duplicate detected: idempotency_key=webhook_12345, skipped<br>   ```<br>5. **Idempotent**: Safe to retry without side effects | None | Order ID: ORD_456<br>Idempotency Key: webhook_12345<br>Expected: Single processing | | | Related: [BE_Payment-30]<br>Idempotency critical |
| SYSTEM_PAY_WEBHOOK_04 | Payment Failed Webhook | Xử lý webhook thanh toán thất bại (Negative Flow) | 1. **Setup**: Order `ORD_789` with `status = 'PENDING'`<br>2. **Send Webhook**: POST with failure payload:<br>   ```json<br>   {<br>     "status": "FAILED",<br>     "reason": "Insufficient funds",<br>     "order_id": "ORD_789",<br>     "signature": "valid_sig"<br>   }<br>   ```<br>3. **Check DB**: Order status<br>4. **Check Notification**: User notification sent | 1. **API Response**: **200 OK** (acknowledged)<br>2. **Database**: Order status changed to `CANCELED` or `FAILED`<br>3. **User Notification**: Email/push notification sent:<br>   Message: "Thanh toán thất bại: Số dư không đủ. Vui lòng thử lại."<br>4. **Logs**:<br>   ```<br>   [INFO] Webhook payment failed: order_id=ORD_789, reason=Insufficient funds<br>   [INFO] Notification sent to user<br>   ```<br>5. **Recovery**: User can retry payment from order history | None | Order ID: ORD_789<br>Status: FAILED<br>Reason: Insufficient funds | | | Related: [BE_Payment-31]<br>Error handling |

---

## Automation Script Examples

### Playwright Example: Stripe Connect Onboarding
```javascript
// Test: SYSTEM_PAY_CONNECT_01
import { test, expect } from '@playwright/test';

test('Stripe Connect Onboarding Success', async ({ page, context }) => {
  // Login as vendor
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'vendor01@test.com');
  await page.fill('[name="password"]', 'Test1234!');
  await page.click('button[type="submit"]');
  
  // Navigate to payment settings
  await page.goto('http://localhost:3000/vendor/payment-settings');
  
  // Click "Connect Payment"
  await page.click('button:has-text("Kết nối thanh toán")');
  
  // Wait for redirect to Stripe
  await page.waitForURL(/connect\.stripe\.com/);
  expect(page.url()).toContain('connect.stripe.com/setup');
  
  // Fill Stripe onboarding form (in test mode, Stripe may auto-fill)
  // Note: Stripe test mode might skip form in some cases
  await page.fill('[name="business_name"]', 'Test Vendor 01');
  
  // Submit form (if visible)
  const submitButton = await page.locator('button:has-text("Submit")');
  if (await submitButton.isVisible()) {
    await submitButton.click();
  }
  
  // Wait for redirect back to our app
  await page.waitForURL(/localhost:3000\/payment\/callback/);
  
  // Check success notification
  await expect(page.locator('.notification')).toContainText('Kết nối thành công');
  
  // Verify database (requires API call or direct DB query)
  const response = await page.request.get('http://localhost:4000/api/users/vendor01/payment-status');
  const data = await response.json();
  expect(data.stripe_account_id).toMatch(/^acct_/);
  expect(data.status).toBe('Connected');
});
```

### Cypress Example: Webhook Testing
```javascript
// Test: SYSTEM_PAY_WEBHOOK_01
describe('Payment Webhook Handling', () => {
  it('should process success webhook correctly', () => {
    // Create order first
    cy.request('POST', 'http://localhost:4000/api/orders', {
      userId: 1,
      items: [{ productId: 'book_01', quantity: 1 }],
      total: 100000
    }).then((response) => {
      const orderId = response.body.id;
      
      // Simulate webhook from payment gateway
      const payload = {
        status: 'SUCCESS',
        order_id: orderId,
        signature: 'valid_signature_here'
      };
      
      // Send webhook
      cy.request('POST', 'http://localhost:4000/api/payment/webhook', payload)
        .then((webhookResponse) => {
          expect(webhookResponse.status).to.eq(200);
          
          // Check order status updated
          cy.request(`http://localhost:4000/api/orders/${orderId}`)
            .then((orderResponse) => {
              expect(orderResponse.body.status).to.eq('PAID');
            });
        });
    });
  });
  
  it('should reject webhook with invalid signature', () => {
    const payload = {
      status: 'SUCCESS',
      order_id: 'ORD_123',
      signature: 'FAKE_SIGNATURE'
    };
    
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/payment/webhook',
      body: payload,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });
});
```

### Node.js Script: Batch Import Test
```javascript
// Test: SYSTEM_PAY_IMPORT_01
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testBatchImport() {
  // Create CSV file
  const csvContent = `Name,Price,Currency,Description
Product 1,100000,VND,Test product 1
Product 2,200000,VND,Test product 2
Product 3,150000,VND,Test product 3
...
Product 50,500000,VND,Test product 50`;
  
  fs.writeFileSync('test_products.csv', csvContent);
  
  // Upload file
  const form = new FormData();
  form.append('file', fs.createReadStream('test_products.csv'));
  
  const response = await axios.post('http://localhost:4000/api/products/import', form, {
    headers: form.getHeaders(),
    auth: { username: 'admin', password: 'admin123' }
  });
  
  console.log('Import response:', response.data);
  // Expected: { success: 50, failed: 0, message: "Import thành công 50/50 bản ghi" }
  
  // Verify database
  const dbResponse = await axios.get('http://localhost:4000/api/products?limit=50');
  console.log('Total products:', dbResponse.data.length); // Should be 50
  
  // Cleanup
  fs.unlinkSync('test_products.csv');
}

testBatchImport();
```

---

## Manual Testing Guide

### Test SYSTEM_PAY_CONNECT_01: Stripe Connect Onboarding

**Step-by-Step:**

1. **Prepare Stripe Test Account**
   - Create account at https://dashboard.stripe.com/test/
   - Copy API keys to `.env` file

2. **Login as Vendor**
   - Navigate to http://localhost:3000/login
   - Email: `vendor01@test.com`, Password: `Test1234!`

3. **Initiate Connection**
   - Go to Settings → Payment Settings
   - Click "Kết nối thanh toán" button

4. **Complete Stripe Onboarding**
   - Browser redirects to Stripe Hosted Onboarding
   - Fill test data:
     - Business name: "Test Vendor 01"
     - Bank routing: `110000000` (Stripe test routing number)
     - Account number: `000123456789`
   - Submit form

5. **Verify Callback**
   - Stripe redirects back to `/payment/callback`
   - Check URL parameters: `?auth_code=ac_xxx&account_id=acct_xxx`

6. **Check Database**
   ```sql
   SELECT id, email, stripe_account_id, status 
   FROM users 
   WHERE email = 'vendor01@test.com';
   ```
   Expected: `stripe_account_id` is populated, `status = 'Connected'`

7. **Verify Stripe Dashboard**
   - Login to Stripe Dashboard → Connect → Accounts
   - Find account `acct_xxx`, check metadata contains `local_user_id`

---

### Test SYSTEM_PAY_WEBHOOK_01: Payment Success Webhook

**Step-by-Step:**

1. **Create Test Order**
   ```sql
   INSERT INTO orders (id, user_id, total, status) 
   VALUES ('ORD_TEST_001', 1, 100000, 'PENDING');
   ```

2. **Calculate Signature**
   ```javascript
   const crypto = require('crypto');
   const secret = process.env.STRIPE_WEBHOOK_SECRET;
   const payload = JSON.stringify({
     status: 'SUCCESS',
     order_id: 'ORD_TEST_001'
   });
   const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
   console.log('Signature:', signature);
   ```

3. **Send Webhook (Postman/CURL)**
   ```bash
   curl -X POST http://localhost:4000/api/payment/webhook \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Signature: <calculated_signature>" \
     -d '{
       "status": "SUCCESS",
       "order_id": "ORD_TEST_001"
     }'
   ```

4. **Check Response**
   - Expect: HTTP 200 OK

5. **Verify Database**
   ```sql
   SELECT status FROM orders WHERE id = 'ORD_TEST_001';
   ```
   Expected: `status = 'PAID'`

6. **Check Logs**
   ```bash
   tail -f logs/app.log | grep "ORD_TEST_001"
   ```
   Look for: `[INFO] Webhook success: order_id=ORD_TEST_001, status=PAID`

---

## Cross-Browser Testing Matrix

| Test Case | Chrome 120+ | Firefox 120+ | Safari 17+ | Edge 120+ |
|-----------|-------------|--------------|------------|-----------|
| SYSTEM_PAY_CONNECT_01 | ✅ | ✅ | ✅ | ✅ |
| SYSTEM_PAY_CONNECT_02 | ✅ | ✅ | ⚠️ (Safari may block popup) | ✅ |
| SYSTEM_PAY_IMPORT_01 | ✅ | ✅ | ✅ | ✅ |
| SYSTEM_PAY_WEBHOOK_01 | N/A (API only) | N/A | N/A | N/A |

**Note**: Stripe Connect Onboarding uses popup windows - test popup blockers disabled.

---

## Performance Requirements

| Metric | Target | Test Case |
|--------|--------|-----------|
| Batch Import (50 rows) | < 5 seconds | SYSTEM_PAY_IMPORT_01 |
| Batch Import (10K rows) | < 30 seconds | SYSTEM_PAY_IMPORT_02 |
| Webhook Response Time | < 500ms | SYSTEM_PAY_WEBHOOK_01 |
| Stripe Connect API Call | < 2 seconds | SYSTEM_PAY_CONNECT_01 |
| Database Query (Sync) | < 200ms | SYSTEM_PAY_SYNC_01 |

---

## Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Stripe Account** | Test Mode enabled |
| **Stripe CLI** | v1.19.0+ (for webhook testing) |
| **Node.js** | v18.0.0+ |
| **Database** | PostgreSQL 15+ or MySQL 8+ |
| **Backend** | NestJS on port 4000 |
| **Frontend** | React/Next.js on port 3000 |

---

## Test Prioritization

### P0 (Critical) - Must Pass Before Release
- SYSTEM_PAY_CONNECT_01 (happy path)
- SYSTEM_PAY_IMPORT_01 (baseline import)
- SYSTEM_PAY_WEBHOOK_01 (payment success)
- SYSTEM_PAY_WEBHOOK_02 (security validation)

### P1 (High) - Important for Stability
- SYSTEM_PAY_IMPORT_02 (load testing)
- SYSTEM_PAY_SYNC_01 (data consistency)
- SYSTEM_PAY_WEBHOOK_03 (idempotency)

### P2 (Medium) - Edge Cases
- SYSTEM_PAY_CONNECT_04 (error handling)
- SYSTEM_PAY_IMPORT_03 (partial failure)
- SYSTEM_PAY_SYNC_03 (conflict resolution)

---

## Notes

- **SYSTEM_PAY_CONNECT_01**: Use Stripe test credentials only
- **SYSTEM_PAY_IMPORT_02**: Monitor server resources during 10K row import
- **SYSTEM_PAY_WEBHOOK_02**: Critical for preventing payment fraud
- **SYSTEM_PAY_WEBHOOK_03**: Prevents duplicate charges when gateway retries
- **Stripe CLI Tool**: Essential for local webhook testing (`stripe listen --forward-to localhost:4000/webhook`)
- **Idempotency Keys**: Use UUID v4 or timestamp-based keys for webhook deduplication
- **Security**: Always validate webhook signatures using HMAC SHA-256
- **Test Database**: Use separate test database, reset before each test suite

---

## Related Documents

- [Payment Unit Tests](../unit_test/payment.unit.spec.ts)
- [Payment Integration Tests](../integration_test/payment.it.spec.ts)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Manual / Cypress / Playwright  
**Maintained By**: Backend QA Team & Payment Integration Team
