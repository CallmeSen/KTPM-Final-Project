# System Test Cases - Detail Module

**Project:** KTPM-Final-Project  
**Module:** Detail (Book Detail Page)  
**Test Type:** System Test / End-to-End Test  
**Framework Recommendation:** Cypress / Playwright  
**Generated Date:** December 17, 2025

---

## Overview

These test cases represent **End-to-End (E2E) scenarios** that require:
- Real browser interaction
- Cross-device testing
- Session management
- Database synchronization
- Multi-user scenarios

These tests should be executed manually or using E2E automation frameworks like **Cypress**, **Playwright**, or **Selenium**.

---

## Test Cases

### 1. [FE_DETAIL-34] ST_FE_DETAIL_GetCart_Standard
**Test Case Name:** Luồng xem giỏ hàng chuẩn

**Description:**  
Kiểm tra luồng chuẩn của việc thêm sản phẩm vào giỏ hàng và xem giỏ hàng.

**Test Procedure:**
1. Mở trình duyệt và truy cập trang chi tiết sách (VD: `/books/10`)
2. Nhập số lượng mua: `1`
3. Click nút "Thêm vào giỏ hàng"
4. Chờ thông báo thành công hiển thị
5. Click vào icon giỏ hàng ở header

**Expected Output:**
1. Hệ thống chuyển hướng sang trang `/cart`
2. Trang giỏ hàng hiển thị đúng sản phẩm vừa thêm:
   - Tên sách
   - Giá
   - Số lượng = 1
   - Tổng tiền chính xác
3. Badge icon giỏ hàng hiển thị số `1`

**Test Data:**
- Book ID: 10
- Quantity: 1

**Prerequisites:**
- User đã đăng nhập (hoặc Guest nếu hỗ trợ)
- Sản phẩm ID=10 tồn tại và còn hàng

**Test Environment:**
- Browser: Chrome, Firefox, Safari
- Device: Desktop

---

### 2. [FE_DETAIL-35] ST_FE_DETAIL_GetCart_EmptyState
**Test Case Name:** Xem giỏ hàng rỗng

**Description:**  
Kiểm tra trạng thái hiển thị khi giỏ hàng không có sản phẩm nào.

**Test Procedure:**
1. Đảm bảo giỏ hàng hiện tại đang trống (xóa hết sản phẩm nếu có)
2. Click vào icon giỏ hàng ở header
3. Hoặc truy cập trực tiếp URL `/cart`

**Expected Output:**
1. Trang hiển thị trạng thái rỗng (Empty State):
   - Hình ảnh hoặc icon minh họa giỏ hàng trống
   - Thông báo: "Giỏ hàng của bạn đang trống" hoặc tương tự
   - Nút "Mua sắm ngay" hoặc "Khám phá sách" để quay lại trang chủ
2. Tổng tiền hiển thị = `0đ` hoặc ẩn hoàn toàn
3. Nút "Thanh toán" bị disable hoặc ẩn

**Test Data:**
- User: New user (chưa thêm sản phẩm nào)

**Prerequisites:**
- User đã đăng nhập hoặc Guest

**Test Environment:**
- Browser: Chrome, Firefox
- Device: Desktop, Mobile

---

### 3. [FE_DETAIL-36] ST_FE_DETAIL_GetCart_CrossDevice
**Test Case Name:** Đồng bộ giỏ hàng đa thiết bị (Cross Device)

**Description:**  
Kiểm tra tính năng đồng bộ giỏ hàng giữa các thiết bị khác nhau của cùng một user.

**Test Procedure:**
1. **Trên Mobile:**
   - Login với tài khoản User A (Email: `userA@example.com`)
   - Thêm sản phẩm X (Book ID=10) vào giỏ hàng với số lượng 2
   - Đăng xuất hoặc để nguyên

2. **Trên Laptop/Desktop:**
   - Login với cùng tài khoản User A
   - Vào trang giỏ hàng `/cart`
   - Kiểm tra danh sách sản phẩm

**Expected Output:**
1. Laptop phải hiển thị sản phẩm X (Book ID=10) với số lượng = 2
2. Giá và tổng tiền khớp với dữ liệu từ Mobile
3. Dữ liệu được lấy từ Server (Database), không phải từ Local Storage

**Verification Points:**
- Kiểm tra Network Tab: API `/api/cart` được gọi khi load trang
- Dữ liệu giỏ hàng không lưu Local Storage (hoặc chỉ dùng làm cache)
- Thay đổi trên thiết bị này phản ánh sang thiết bị kia sau khi refresh

**Test Data:**
- User: userA@example.com
- Device 1: Mobile (iOS/Android)
- Device 2: Desktop (Windows/Mac)
- Product: Book ID=10, Quantity=2

**Prerequisites:**
- User A đã đăng ký tài khoản
- Cả 2 thiết bị có kết nối Internet
- Backend hỗ trợ lưu giỏ hàng vào Database

**Test Environment:**
- Browser: Chrome Mobile, Chrome Desktop
- Network: 4G/Wifi

---

### 4. [FE_DETAIL-37] ST_FE_DETAIL_GetCart_LoginMerge
**Test Case Name:** Gộp giỏ hàng sau khi đăng nhập (Merge Cart)

**Description:**  
Kiểm tra logic gộp giỏ hàng khi user vừa mua hàng ở chế độ Guest, sau đó đăng nhập vào tài khoản đã có sẵn giỏ hàng.

**Test Procedure:**
1. **Chế độ Guest (chưa đăng nhập):**
   - Vào trang chi tiết sách A (Book ID=5)
   - Thêm sản phẩm A vào giỏ hàng với số lượng 1
   - Giỏ hàng Guest hiện có: [A x1]

2. **Đăng nhập:**
   - Click "Đăng nhập"
   - Login với tài khoản User B (tài khoản này đã có sẵn sản phẩm B trong giỏ)
   - Sau khi login thành công, hệ thống redirect về trang chủ hoặc trang trước đó

3. **Kiểm tra giỏ hàng:**
   - Vào trang giỏ hàng `/cart`

**Expected Output:**
1. Giỏ hàng hiển thị **cả 2 sản phẩm**:
   - Sản phẩm A (từ Guest session) x1
   - Sản phẩm B (từ User B account) x{số lượng có sẵn}
2. Hệ thống tự động **merge** giỏ hàng Guest vào User
3. Nếu sản phẩm trùng nhau (cùng Book ID), số lượng được cộng dồn
4. Giỏ hàng Guest được xóa sau khi merge

**Business Logic Validation:**
- Nếu Guest có A x2, User có A x3 → Sau merge: A x5
- Không bị mất dữ liệu giỏ hàng Guest
- Không bị duplicate item

**Test Data:**
- Guest Cart: Product A (Book ID=5, Qty=1)
- User B Cart (before login): Product B (Book ID=8, Qty=2)
- Expected Result: [A x1, B x2]

**Prerequisites:**
- User B đã đăng ký và có sản phẩm trong giỏ
- Backend hỗ trợ merge cart logic

**Test Environment:**
- Browser: Chrome, Firefox
- Device: Desktop

---

### 5. [FE_DETAIL-38] ST_FE_DETAIL_GetCart_SessionExpired
**Test Case Name:** Xem giỏ hàng khi hết phiên đăng nhập

**Description:**  
Kiểm tra hành vi của hệ thống khi user đang xem giỏ hàng nhưng phiên đăng nhập (Session/Token) đã hết hạn.

**Test Procedure:**
1. **Setup:**
   - Login với tài khoản User C
   - Thêm sản phẩm vào giỏ hàng
   - Xác nhận giỏ hàng đã có dữ liệu

2. **Simulate Token Expiry (3 cách):**
   - **Cách 1 (Manual):** Mở DevTools (F12) → Application/Storage → Xóa token trong LocalStorage/Cookie
   - **Cách 2 (Wait):** Đợi token hết hạn tự nhiên (VD: 30 phút)
   - **Cách 3 (Backend):** Invalidate token từ server (nếu có API)

3. **Trigger Action:**
   - Reload trang `/cart` (F5)
   - Hoặc thực hiện thao tác khác (thêm sản phẩm, cập nhật số lượng)

**Expected Output:**
1. Hệ thống phát hiện token hết hạn (API trả về 401 Unauthorized)
2. **Auto logout:** Tự động xóa session và chuyển user về trạng thái Guest
3. **Redirect:** Chuyển hướng sang trang Login (`/auth/login`)
4. Hiển thị thông báo: 
   - "Phiên đăng nhập đã hết hạn"
   - "Vui lòng đăng nhập lại để tiếp tục"
5. Sau khi đăng nhập lại:
   - Giỏ hàng được khôi phục (nếu lưu trên server)
   - Hoặc hiển thị giỏ hàng rỗng (nếu chỉ lưu client-side)

**Security Validation:**
- Token không còn gửi kèm trong request
- Không thể truy cập các trang yêu cầu authentication
- Không lộ thông tin user sau khi logout

**Test Data:**
- User: userC@example.com
- Token Expiry: Simulate by deleting token manually

**Prerequisites:**
- Token có thời gian hết hạn (VD: 30 min, 1 hour)
- Backend trả về 401 khi token invalid

**Test Environment:**
- Browser: Chrome, Firefox
- Device: Desktop, Mobile
- Network: Online

---

## Execution Recommendations

### Manual Testing
1. Follow the procedures step-by-step
2. Use different browsers and devices as specified
3. Document actual results with screenshots
4. Report any discrepancies between expected and actual behavior

### E2E Automation (Cypress Example)

```typescript
describe('Detail Module - System Tests', () => {
  
  it('[FE_DETAIL-34] should navigate to cart after adding item', () => {
    cy.visit('/books/10');
    cy.get('input[name="quantity"]').type('1');
    cy.get('button').contains('Thêm vào giỏ').click();
    cy.get('.cart-icon').click();
    cy.url().should('include', '/cart');
    cy.get('.cart-item').should('have.length', 1);
  });

  it('[FE_DETAIL-35] should show empty state when cart is empty', () => {
    cy.visit('/cart');
    cy.get('.empty-state').should('be.visible');
    cy.contains('Giỏ hàng trống').should('exist');
  });

  it('[FE_DETAIL-38] should redirect to login when session expires', () => {
    cy.visit('/cart');
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload();
    cy.url().should('include', '/auth/login');
    cy.contains('Phiên đăng nhập đã hết hạn').should('be.visible');
  });
});
```

---

## Test Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Browsers** | Chrome (latest), Firefox (latest), Safari 14+ |
| **Devices** | Desktop (1920x1080), Tablet (768x1024), Mobile (375x667) |
| **OS** | Windows 10+, macOS, iOS 14+, Android 10+ |
| **Network** | Wifi, 4G (test under different network conditions) |
| **Backend** | Development/Staging server with test database |
| **Test Data** | Seeded test users and products |

---

## Notes

- System tests should be run in a **staging environment**, not production
- Ensure test database is isolated and can be reset between test runs
- For Cross-Device tests, use real devices when possible (not just browser DevTools)
- Session expiry tests require coordination with backend token configuration
- Document all bugs found with screenshots and browser console logs

---

## Related Documents

- [Unit Test Spec](../unit-test/detail.unit.spec.ts)
- [Integration Test Spec](../integration-test/detail.it.spec.ts)
- [API Documentation](../../../Backend/README.md)
