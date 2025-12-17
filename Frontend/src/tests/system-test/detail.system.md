# Detail Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Detail (Book Detail Page) Module in standardized table format.

**Module:** Detail (Book Detail Page)  
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

### Test Prerequisites
- User account: user@example.com / password123
- Guest user (not logged in)
- Book with ID=10 exists with stock >= 5
- API endpoints: `/api/cart`, `/api/books/:id`, `/api/comments`

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_DETAIL_CART_01 | Standard Add to Cart Flow | Luồng xem giỏ hàng chuẩn sau khi thêm sản phẩm | 1. Mở trình duyệt và truy cập `/books/10`<br>2. Nhập số lượng mua: `1`<br>3. Click nút "Thêm vào giỏ hàng"<br>4. Chờ thông báo thành công hiển thị<br>5. Click vào icon giỏ hàng ở header | 1. Redirect sang trang `/cart`<br>2. Trang giỏ hàng hiển thị đúng sản phẩm vừa thêm (tên sách, giá, số lượng=1)<br>3. Tổng tiền chính xác<br>4. Badge icon giỏ hàng hiển thị số `1` | None | Book ID: 10<br>Quantity: 1<br>User: Logged in | | | Related: [FE_DETAIL-34] |
| SYSTEM_DETAIL_CART_02 | Empty Cart State | Xem giỏ hàng rỗng | 1. Đảm bảo giỏ hàng đang trống (xóa hết sản phẩm nếu có)<br>2. Click vào icon giỏ hàng ở header<br>3. Hoặc truy cập trực tiếp URL `/cart` | 1. Trang hiển thị Empty State (hình ảnh giỏ hàng trống)<br>2. Thông báo: "Giỏ hàng của bạn đang trống"<br>3. Nút "Mua sắm ngay" để quay lại trang chủ<br>4. Tổng tiền = `0đ` hoặc ẩn<br>5. Nút "Thanh toán" bị disable hoặc ẩn | None | User: New user (no items)<br>Cart: Empty | | | Related: [FE_DETAIL-35]<br>Test both Desktop & Mobile |
| SYSTEM_DETAIL_CART_03 | Cross Device Sync | Đồng bộ giỏ hàng đa thiết bị | 1. **Trên Mobile**: Login với `userA@example.com`, thêm Book ID=10 vào giỏ với số lượng 2<br>2. **Trên Desktop**: Login với cùng tài khoản<br>3. Vào trang `/cart`<br>4. Kiểm tra danh sách sản phẩm | 1. Desktop hiển thị Book ID=10 với số lượng=2<br>2. Giá và tổng tiền khớp với Mobile<br>3. Dữ liệu từ Server (Database), không phải Local Storage<br>4. API `/api/cart` được gọi khi load trang | None | User: userA@example.com<br>Device 1: Mobile (iOS/Android)<br>Device 2: Desktop<br>Product: Book ID=10, Qty=2 | | | Related: [FE_DETAIL-36]<br>Requires backend cart storage |
| SYSTEM_DETAIL_CART_04 | Cart Merge After Login | Gộp giỏ hàng sau khi đăng nhập | 1. **Guest mode**: Vào `/books/5`, thêm Product A vào giỏ (qty=1)<br>2. **Login**: Đăng nhập với User B (tài khoản đã có sẵn Product B trong giỏ)<br>3. Sau login, vào `/cart`<br>4. Kiểm tra danh sách | 1. Giỏ hàng hiển thị **cả 2 sản phẩm**: Product A (Guest) + Product B (User)<br>2. Nếu sản phẩm trùng, số lượng cộng dồn (Guest A x2 + User A x3 = A x5)<br>3. Giỏ hàng Guest được merge vào User<br>4. Không duplicate item | None | Guest Cart: Product A (ID=5, Qty=1)<br>User B Cart: Product B (ID=8, Qty=2)<br>Expected: [A x1, B x2] | | | Related: [FE_DETAIL-37]<br>Business logic: Merge carts |
| SYSTEM_DETAIL_CART_05 | Session Expired Handling | Xem giỏ hàng khi hết phiên đăng nhập | 1. Login với User C, thêm sản phẩm vào giỏ<br>2. **Simulate token expiry**: Xóa token trong DevTools (Application → LocalStorage) hoặc đợi token hết hạn<br>3. Reload trang `/cart` (F5) hoặc thực hiện action | 1. Hệ thống phát hiện token hết hạn (API 401 Unauthorized)<br>2. Auto logout, xóa session<br>3. Redirect sang `/auth/login`<br>4. Hiển thị: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"<br>5. Sau login: Giỏ hàng khôi phục (nếu lưu server) hoặc rỗng (nếu client-side) | None | User: userC@example.com<br>Action: Delete token manually<br>Token Expiry: Simulate | | | Related: [FE_DETAIL-38]<br>Security: 401 handling |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Detail Module System Tests', () => {
  it('[SYSTEM_DETAIL_CART_01] Standard add to cart flow', () => {
    cy.visit('/books/10');
    cy.get('[data-testid="quantity-input"]').clear().type('1');
    cy.get('[data-testid="add-to-cart-btn"]').click();
    
    // Wait for success toast
    cy.contains('Thêm vào giỏ hàng thành công').should('be.visible');
    
    // Click cart icon
    cy.get('[data-testid="cart-icon"]').click();
    
    // Assert redirected to cart page
    cy.url().should('include', '/cart');
    cy.get('.cart-item').should('have.length', 1);
    cy.contains('Book Title').should('be.visible');
  });

  it('[SYSTEM_DETAIL_CART_02] Empty cart state', () => {
    // Clear cart first
    cy.request('DELETE', '/api/cart/clear');
    
    cy.visit('/cart');
    
    // Assert empty state
    cy.get('[data-testid="empty-cart"]').should('be.visible');
    cy.contains('Giỏ hàng của bạn đang trống').should('be.visible');
    cy.get('[data-testid="shop-now-btn"]').should('be.visible');
    cy.get('[data-testid="checkout-btn"]').should('be.disabled');
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_DETAIL_CART_03] Cross device sync', async ({ browser }) => {
  // Simulate mobile device
  const mobileContext = await browser.newContext({
    ...devices['iPhone 14 Pro']
  });
  const mobilePage = await mobileContext.newPage();
  
  // Login on mobile and add to cart
  await mobilePage.goto('/auth/login');
  await mobilePage.fill('[name="email"]', 'userA@example.com');
  await mobilePage.fill('[name="password"]', 'password123');
  await mobilePage.click('[type="submit"]');
  
  await mobilePage.goto('/books/10');
  await mobilePage.fill('[data-testid="quantity-input"]', '2');
  await mobilePage.click('[data-testid="add-to-cart-btn"]');
  
  // Simulate desktop device
  const desktopContext = await browser.newContext();
  const desktopPage = await desktopContext.newPage();
  
  // Login on desktop with same account
  await desktopPage.goto('/auth/login');
  await desktopPage.fill('[name="email"]', 'userA@example.com');
  await desktopPage.fill('[name="password"]', 'password123');
  await desktopPage.click('[type="submit"]');
  
  // Go to cart
  await desktopPage.goto('/cart');
  
  // Assert cart synced
  await expect(desktopPage.locator('[data-product-id="10"]')).toBeVisible();
  await expect(desktopPage.locator('[data-testid="quantity-10"]')).toContainText('2');
});

test('[SYSTEM_DETAIL_CART_05] Session expired handling', async ({ page }) => {
  // Login
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'userC@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  
  // Add to cart
  await page.goto('/books/10');
  await page.click('[data-testid="add-to-cart-btn"]');
  
  // Simulate token expiry by clearing localStorage
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  });
  
  // Try to access cart
  await page.goto('/cart');
  
  // Should redirect to login
  await expect(page).toHaveURL(/.*\/auth\/login/);
  await expect(page.locator('.error-message')).toContainText('Phiên đăng nhập đã hết hạn');
});
```

---

## Test Execution Commands

```bash
# Run all detail system tests
npx cypress run --spec "cypress/e2e/detail.system.cy.js"

# Run specific test
npx playwright test --grep "SYSTEM_DETAIL_CART"

# Cross-device testing
npx playwright test --grep "SYSTEM_DETAIL_CART_03" --project=mobile-chrome --project=desktop

# Session expiry test
npx playwright test --grep "SYSTEM_DETAIL_CART_05"
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Add to Cart | ✅ | ✅ | ✅ | ✅ |
| Empty State Display | ✅ | ✅ | ✅ | ✅ |
| Cart Sync (Server) | ✅ | ✅ | ✅ | ✅ |
| Cart Merge Logic | ✅ | ✅ | ✅ | ✅ |
| Session Expiry | ✅ | ✅ | ⚠️ Cookie behavior | ✅ |

**Legend:**
- ✅ Fully supported
- ⚠️ Safari: May have different cookie/localStorage behavior in private mode

---

## Test Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Browsers** | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| **Devices** | Desktop (1920x1080), Tablet (768x1024), Mobile (375x667) |
| **OS** | Windows 10+, macOS 12+, iOS 14+, Android 10+ |
| **Network** | Stable Wifi (10+ Mbps) for sync tests |
| **Backend** | Staging server with test database |
| **Test Users** | 3 test accounts (userA, userB, userC) |

---

## Test Prioritization

### P0 (Critical) - Must Pass
- SYSTEM_DETAIL_CART_01 (core user flow)
- SYSTEM_DETAIL_CART_05 (security: session expiry)

### P1 (High) - Important
- SYSTEM_DETAIL_CART_02 (UX: empty state)
- SYSTEM_DETAIL_CART_04 (business logic: cart merge)

### P2 (Medium) - Nice to Have
- SYSTEM_DETAIL_CART_03 (advanced feature: cross-device sync)

---

## Notes

- **SYSTEM_DETAIL_CART_03**: Requires backend cart storage (not just localStorage)
- **SYSTEM_DETAIL_CART_04**: Test merge logic carefully - ensure no duplicate items
- **SYSTEM_DETAIL_CART_05**: Token expiry time typically 30min-1hour (configurable)
- Use **staging environment only**, never production
- Clear cart before each test to avoid conflicts
- For cross-device tests, use real devices when possible (not just browser DevTools)
- Document any browser-specific issues with screenshots

---

## Related Documents

- [Unit Test Spec](../unit-test/detail.unit.spec.ts)
- [Integration Test Spec](../integration-test/detail.it.spec.ts)
- [API Documentation](../../../Backend/docs/cart-api.md)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Maintained By**: QA Automation Team
