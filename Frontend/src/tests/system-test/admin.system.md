# Admin Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Admin Module in standardized table format.

**Module:** Admin  
**Test Type:** System Test / E2E  
**Framework:** Cypress 13.x / Playwright 1.40.x  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// Cypress/Playwright config
baseUrl: 'http://localhost:3000'
viewport: 1920x1080
timeout: 10000ms
```

### Test Users
- **Admin**: admin@example.com / admin123 (role: admin)
- **Regular User**: user@example.com / user123 (role: user)
- **Locked Admin**: locked@example.com / admin123 (is_active: false)

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_ADMIN_AUTH_01 | Admin Login Success | Kiểm tra đăng nhập thành công với quyền Admin | 1. Visit `/admin/login`<br>2. Enter email: `admin@example.com`<br>3. Enter password: `admin123`<br>4. Click "Login" button<br>5. Wait for redirect | 1. Redirect to `/admin/dashboard`<br>2. Admin menu visible with "Quản lý User", "Quản lý Sản phẩm"<br>3. Token stored in localStorage<br>4. User info displayed in header | None | Email: admin@example.com<br>Password: admin123<br>Role: admin | | | Related: [FE_ADMIN-1] |
| SYSTEM_ADMIN_AUTH_02 | Regular User Denied Access | User thường không được truy cập Admin panel | 1. Visit `/admin/login`<br>2. Enter email: `user@example.com`<br>3. Enter password: `user123`<br>4. Click "Login" button | 1. Error message: "Bạn không có quyền truy cập"<br>2. Stay on `/admin/login` page<br>3. No token stored in localStorage<br>4. No redirect to dashboard | None | Email: user@example.com<br>Password: user123<br>Role: user | | | Related: [FE_ADMIN-2] |
| SYSTEM_ADMIN_AUTH_03 | Locked Account Denied | Tài khoản Admin bị khóa không thể đăng nhập | 1. Visit `/admin/login`<br>2. Enter email: `locked@example.com`<br>3. Enter password: `admin123`<br>4. Click "Login" button | 1. Error message: "Tài khoản bị khóa"<br>2. Support link visible<br>3. No access granted<br>4. Stay on login page | None | Email: locked@example.com<br>is_active: false | | | Related: [FE_ADMIN-4] |
| SYSTEM_ADMIN_AUTH_04 | Deep Link Redirect | Redirect về intended URL sau khi login | 1. Try to access `/admin/products` (not logged in)<br>2. Should redirect to `/admin/login`<br>3. Login with admin credentials<br>4. Check final URL | 1. After login, redirect to `/admin/products` (NOT dashboard)<br>2. Products table visible<br>3. Intended URL preserved | SYSTEM_ADMIN_AUTH_01 | Email: admin@example.com<br>Intended URL: /admin/products | | | Related: [FE_ADMIN-5] |
| SYSTEM_ADMIN_USERS_01 | View Paginated User List | Xem danh sách user với phân trang | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Check table displays 10 users<br>4. Click "Next" button<br>5. Verify page 2 loads | 1. Users table visible with 10 rows<br>2. Pagination info: "Trang 1 / Tổng: 50"<br>3. Page 2 shows different 10 users<br>4. No duplicate users between pages | SYSTEM_ADMIN_AUTH_01 | Total users: 50<br>Per page: 10 | | | Related: [FE_ADMIN-6], [FE_ADMIN-7] |
| SYSTEM_ADMIN_USERS_02 | Search User by Name | Tìm kiếm user theo tên | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Enter "Nguyen Van A" in search box<br>4. Click "Search" button | 1. Results contain only users with "Nguyen Van A" in name<br>2. Other users filtered out<br>3. Search results accurate | SYSTEM_ADMIN_AUTH_01 | Keyword: "Nguyen Van A" | | | Related: [FE_ADMIN-8] |
| SYSTEM_ADMIN_USERS_03 | Search User by Email | Tìm kiếm user theo email | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Enter "test@example.com" in search box<br>4. Click "Search" | 1. Exactly 1 user returned<br>2. Email matches search term<br>3. Unique result | SYSTEM_ADMIN_AUTH_01 | Email: test@example.com | | | Related: [FE_ADMIN-9] |
| SYSTEM_ADMIN_USERS_04 | Filter Active Users | Lọc user đang hoạt động | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Select "Active" from status filter<br>4. Verify results | 1. All users have status badge "Active"<br>2. is_active = true for all<br>3. No banned users shown | SYSTEM_ADMIN_AUTH_01 | Status: Active | | | Related: [FE_ADMIN-10] |
| SYSTEM_ADMIN_USERS_05 | Filter Banned Users | Lọc user bị khóa | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Select "Banned" from status filter<br>4. Check all results | 1. All users have status badge "Banned"<br>2. is_active = false for all<br>3. No active users shown | SYSTEM_ADMIN_AUTH_01 | Status: Banned | | | Related: [FE_ADMIN-11] |
| SYSTEM_ADMIN_USERS_06 | Ban User Account | Khóa tài khoản user | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Find user "user1@example.com"<br>4. Click "Ban" button<br>5. Confirm modal<br>6. Wait for update | 1. Status changes to "Banned"<br>2. Button changes to "Unban"<br>3. User cannot login anymore<br>4. Success toast message | SYSTEM_ADMIN_AUTH_01 | User: user1@example.com<br>Action: Ban | | | Related: [FE_ADMIN-13] |
| SYSTEM_ADMIN_USERS_07 | Unban User Account | Mở khóa tài khoản user | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Find banned user<br>4. Click "Unban" button<br>5. Confirm action | 1. Status changes to "Active"<br>2. Button changes to "Ban"<br>3. User can login again<br>4. Success message displayed | SYSTEM_ADMIN_USERS_06 | User: user1@example.com<br>Action: Unban | | | Related: [FE_ADMIN-14] |
| SYSTEM_ADMIN_USERS_08 | Upgrade User Role | Nâng quyền user lên admin | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Click "Edit" on user1<br>4. Change role to "Admin"<br>5. Save changes | 1. Role badge shows "Admin"<br>2. Success message displayed<br>3. User has admin privileges<br>4. Database updated | SYSTEM_ADMIN_AUTH_01 | User: user1@example.com<br>Old role: user<br>New role: admin | | | Related: [FE_ADMIN-12] |
| SYSTEM_ADMIN_PRODUCTS_01 | Create Product Valid | Tạo sản phẩm mới thành công | 1. Login as admin<br>2. Visit `/admin/products`<br>3. Click "Add Product"<br>4. Fill form: name, price, description, image, category<br>5. Click "Save" | 1. Product appears in list<br>2. Status 201 Created<br>3. Success toast message<br>4. Product at top of list | SYSTEM_ADMIN_AUTH_01 | Name: New Product<br>Price: 300000<br>Category: 1 | | | Related: [FE_ADMIN-15] |
| SYSTEM_ADMIN_PRODUCTS_02 | Validation Empty Name | Bỏ trống tên sản phẩm | 1. Login as admin<br>2. Click "Add Product"<br>3. Leave name field empty<br>4. Fill other fields<br>5. Click "Save" | 1. Error message: "Tên sản phẩm là bắt buộc"<br>2. No API call<br>3. Stay on form<br>4. Form not submitted | SYSTEM_ADMIN_AUTH_01 | Name: (empty) | | | Related: [FE_ADMIN-16] |
| SYSTEM_ADMIN_PRODUCTS_03 | Validation Negative Price | Giá sản phẩm âm | 1. Login as admin<br>2. Click "Add Product"<br>3. Enter price: -1000<br>4. Fill other fields<br>5. Click "Save" | 1. Error: "Giá phải lớn hơn 0"<br>2. No API call<br>3. Form validation blocks submission | SYSTEM_ADMIN_AUTH_01 | Price: -1000 | | | Related: [FE_ADMIN-17] |
| SYSTEM_ADMIN_PRODUCTS_04 | Invalid Image Format | Upload file không phải ảnh | 1. Login as admin<br>2. Click "Add Product"<br>3. Upload virus.exe file<br>4. Attempt to save | 1. Error: "Chỉ chấp nhận file ảnh (jpg, png)"<br>2. File rejected<br>3. No upload occurs | SYSTEM_ADMIN_AUTH_01 | File: virus.exe<br>Type: executable | | | Related: [FE_ADMIN-18] |
| SYSTEM_ADMIN_PRODUCTS_05 | Large Image File | Ảnh quá dung lượng | 1. Login as admin<br>2. Click "Add Product"<br>3. Upload 6MB image (limit: 2MB)<br>4. Try to save | 1. Error: "Dung lượng ảnh quá lớn"<br>2. File not uploaded<br>3. Validation blocks action | SYSTEM_ADMIN_AUTH_01 | File size: 6MB<br>Limit: 2MB | | | Related: [FE_ADMIN-19] |
| SYSTEM_ADMIN_PRODUCTS_06 | Update Product | Cập nhật thông tin sản phẩm | 1. Login as admin<br>2. Visit `/admin/products`<br>3. Click "Edit" on Product A<br>4. Change price: 100k → 200k<br>5. Click "Update" | 1. Price updated to 200k<br>2. API PUT success<br>3. List refreshes<br>4. New price displayed | SYSTEM_ADMIN_AUTH_01 | Product: Product A<br>Old price: 100000<br>New price: 200000 | | | Related: [FE_ADMIN-20] |
| SYSTEM_ADMIN_PRODUCTS_07 | Delete Product Soft | Xóa sản phẩm (Soft Delete) | 1. Login as admin<br>2. Find Product B (not in orders)<br>3. Click "Delete"<br>4. Confirm modal | 1. Product disappears from list<br>2. DB: is_deleted = true<br>3. Success message<br>4. Not hard deleted | SYSTEM_ADMIN_AUTH_01 | Product: Product B<br>In orders: No | | | Related: [FE_ADMIN-22] |
| SYSTEM_ADMIN_PRODUCTS_08 | Delete Product in Orders | Không thể xóa sản phẩm đang trong đơn hàng | 1. Login as admin<br>2. Find Product C (in pending order)<br>3. Click "Delete"<br>4. Confirm | 1. Error: "Không thể xóa sản phẩm đang được xử lý"<br>2. Action blocked<br>3. Product still in list | SYSTEM_ADMIN_AUTH_01 | Product: Product C<br>In orders: Yes (pending) | | | Related: [FE_ADMIN-23] |
| SYSTEM_ADMIN_ORDERS_01 | View All Orders | Xem danh sách đơn hàng | 1. Login as admin<br>2. Visit `/admin/orders`<br>3. Check table displays orders | 1. Orders table visible<br>2. Columns: Order ID, Customer, Total, Status<br>3. All orders listed | SYSTEM_ADMIN_AUTH_01 | Orders: Multiple | | | Related: [FE_ADMIN-24] |
| SYSTEM_ADMIN_ORDERS_02 | Update Order Status | Cập nhật trạng thái đơn hàng | 1. Login as admin<br>2. Find order with status "Pending"<br>3. Change to "Shipping"<br>4. Confirm | 1. Status updated to "Shipping"<br>2. Success message<br>3. Email sent to customer (optional) | SYSTEM_ADMIN_AUTH_01 | Order: #1<br>Old: Pending<br>New: Shipping | | | Related: [FE_ADMIN-25] |
| SYSTEM_ADMIN_ORDERS_03 | Invalid Status Reversal | Không thể chuyển ngược trạng thái | 1. Login as admin<br>2. Find order status "Delivered"<br>3. Try to change to "Pending"<br>4. Submit | 1. Error: "Không thể chuyển ngược trạng thái"<br>2. Action blocked<br>3. Status unchanged | SYSTEM_ADMIN_AUTH_01 | Order: #2<br>Current: Delivered<br>Attempt: Pending | | | Related: [FE_ADMIN-26] |
| SYSTEM_ADMIN_ORDERS_04 | View Order Details | Xem chi tiết đơn hàng | 1. Login as admin<br>2. Click on order ID<br>3. Check detail page | 1. Order items list visible<br>2. Shipping address shown<br>3. Payment history displayed<br>4. All info complete | SYSTEM_ADMIN_AUTH_01 | Order: #1 | | | Related: [FE_ADMIN-27] |
| SYSTEM_ADMIN_STATS_01 | View Revenue Stats | Thống kê doanh thu | 1. Login as admin<br>2. Visit `/admin/dashboard`<br>3. Check revenue widget | 1. Revenue number displayed<br>2. Chart/graph visible<br>3. Matches completed orders total<br>4. Period shown (e.g., "Tháng này") | SYSTEM_ADMIN_AUTH_01 | Period: Current month<br>Completed orders: 2 | | | Related: [FE_ADMIN-28] |
| SYSTEM_ADMIN_STATS_02 | View User Count Stats | Thống kê số lượng user | 1. Login as admin<br>2. Check dashboard<br>3. Find user count widget | 1. Total users: 50<br>2. Growth indicator shown<br>3. Accurate count | SYSTEM_ADMIN_AUTH_01 | Total users: 50 | | | Related: [FE_ADMIN-29] |
| SYSTEM_ADMIN_STATS_03 | Filter Stats by Date Range | Lọc thống kê theo ngày | 1. Login as admin<br>2. Select start date: 2023-12-01<br>3. Select end date: 2023-12-15<br>4. Click "Apply" | 1. Chart updates to show only selected range<br>2. Date range label displayed<br>3. Accurate data for period | SYSTEM_ADMIN_AUTH_01 | Start: 2023-12-01<br>End: 2023-12-15 | | | Related: [FE_ADMIN-30] |
| SYSTEM_ADMIN_EXPORT_01 | Export Users CSV | Xuất báo cáo user ra CSV | 1. Login as admin<br>2. Visit `/admin/users`<br>3. Click "Export" button<br>4. Wait for download | 1. CSV file downloads<br>2. File contains user data<br>3. Headers: id, username, email<br>4. Data matches web display | SYSTEM_ADMIN_AUTH_01 | Format: CSV<br>Data: All users | | | Related: [FE_ADMIN-31] |
| SYSTEM_ADMIN_IMPORT_01 | Import Products Valid | Nhập dữ liệu từ Excel | 1. Login as admin<br>2. Visit `/admin/products`<br>3. Click "Import"<br>4. Upload valid products.csv<br>5. Click "Upload" | 1. Success: "Import thành công 2 sản phẩm"<br>2. New products in list<br>3. Database updated | SYSTEM_ADMIN_AUTH_01 | File: products.csv<br>Rows: 2<br>Format: Valid | | | Related: [FE_ADMIN-32] |
| SYSTEM_ADMIN_IMPORT_02 | Import Invalid Format | Import file sai định dạng | 1. Login as admin<br>2. Click "Import"<br>3. Upload invalid.csv (missing columns)<br>4. Attempt upload | 1. Error: "Lỗi định dạng tại dòng 1: Thiếu cột price"<br>2. No data imported<br>3. Error details shown | SYSTEM_ADMIN_AUTH_01 | File: invalid.csv<br>Error: Missing column | | | Related: [FE_ADMIN-33] |
| SYSTEM_ADMIN_AUDIT_01 | Audit Log Login | Ghi log đăng nhập Admin | 1. Admin A logs in<br>2. Visit `/admin/audit-logs`<br>3. Check logs | 1. Log entry: "Admin A logged in at [Time]"<br>2. Timestamp recorded<br>3. Action tracked | None | Admin: admin<br>Action: Login | | | Related: [FE_ADMIN-34] |
| SYSTEM_ADMIN_AUDIT_02 | Audit Log Delete Action | Ghi log hành động xóa | 1. Login as admin<br>2. Delete user #5<br>3. Check audit logs | 1. Log: "Admin [Name] deleted User [ID]"<br>2. Target ID recorded<br>3. Timestamp present<br>4. Sensitive action tracked | SYSTEM_ADMIN_AUTH_01 | Admin: admin<br>Action: Delete User<br>Target: User #5 | | | Related: [FE_ADMIN-35] |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Admin System Tests', () => {
  it('[SYSTEM_ADMIN_AUTH_01] Admin login success', () => {
    cy.visit('/admin/login');
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('[SYSTEM_ADMIN_USERS_01] View paginated users', () => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin/users');
    cy.get('[data-testid="user-row"]').should('have.length', 10);
    cy.get('[data-testid="next-page-btn"]').click();
    cy.url().should('include', 'page=2');
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_ADMIN_AUTH_04] Deep link redirect', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page).toHaveURL(/.*admin\/login/);
  
  await page.fill('[data-testid="email-input"]', 'admin@example.com');
  await page.fill('[data-testid="password-input"]', 'admin123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL(/.*admin\/products/);
});
```

---

## Test Execution Commands

```bash
# Run all admin system tests (Cypress)
npx cypress run --spec "cypress/e2e/admin.system.cy.js"

# Run specific test (Playwright)
npx playwright test --grep "SYSTEM_ADMIN_AUTH"

# Generate HTML report
npx playwright show-report

# Cross-browser testing
npx playwright test --project=chromium --project=firefox --project=webkit
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Admin Login | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ |
| Product CRUD | ✅ | ✅ | ✅ | ✅ |
| CSV Import/Export | ✅ | ✅ | ⚠️ Download UX | ✅ |
| Dashboard Charts | ✅ | ✅ | ✅ | ✅ |

---

## Performance Requirements

- Admin login: < 2s
- User list load (10 items): < 1s
- Dashboard stats: < 3s
- CSV export (50 users): < 5s
- Product image upload: < 3s per file

---

## Notes

- Execute in **staging environment only**, never production
- Use isolated test database that can be reset
- Document browser-specific issues with screenshots
- All sensitive actions should be logged in audit trail
- Test data should be seeded before test execution

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x
