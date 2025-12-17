# Cart Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Cart Module in standardized table format.

**Module:** Cart (Shopping Cart)  
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
- Product with ID=1 exists with stock >= 20
- Shopping cart API endpoints: `/api/cart`, `/api/cart/update`, `/api/cart/delete`

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_CART_DEBOUNCE_01 | Rapid Click Debounce | Kiểm tra cơ chế debounce khi user click nhanh liên tục | 1. Login và thêm Product ID=1 vào giỏ hàng<br>2. Mở DevTools → Network tab<br>3. Filter endpoint `/api/cart/update`<br>4. Click nút "Tăng (+)" **10 lần liên tiếp** trong 1 giây<br>5. Đợi 1 giây (debounce timer)<br>6. Kiểm tra số lượng API requests | 1. Chỉ có **1 request** được gửi đi (không phải 10 requests)<br>2. Request chứa số lượng mới nhất: quantity=11<br>3. UI cập nhật mượt mà, không lag<br>4. Server không bị overload | None | Product ID: 1<br>Initial Qty: 1<br>Clicks: 10 times<br>Debounce: 300ms | | | Related: [FE_CART-11]<br>Priority: P0 (Critical) |
| SYSTEM_CART_MODAL_01 | Close Modal by Overlay | Đóng popup xác nhận bằng cách click overlay | 1. Login và có sản phẩm trong giỏ<br>2. Click icon "Thùng rác" tại Product ID=1<br>3. Popup xác nhận hiện lên<br>4. Click vào vùng tối (overlay) bên ngoài popup<br>5. Kiểm tra popup và API calls | 1. Popup đóng lại ngay lập tức<br>2. Không có API DELETE được gọi<br>3. Sản phẩm vẫn còn trong danh sách<br>4. Tổng tiền không thay đổi | None | Product ID: 1<br>Action: Click overlay | | | Related: [FE_CART-15]<br>Priority: P1 |
| SYSTEM_CART_MODAL_02 | Close Modal by X Button | Đóng popup bằng nút X | 1. Login và có sản phẩm trong giỏ<br>2. Click icon "Thùng rác"<br>3. Popup hiện lên<br>4. Click nút X (close button) ở góc popup<br>5. Verify không có action nào được thực thi | 1. Popup đóng lại<br>2. Không có API DELETE<br>3. Sản phẩm vẫn tồn tại<br>4. UI không thay đổi | None | Product ID: 1<br>Action: Click X button | | | Related: [FE_CART-15]<br>Priority: P1 |
| SYSTEM_CART_MODAL_03 | Close Modal by ESC Key | Đóng popup bằng phím ESC | 1. Login và có sản phẩm trong giỏ<br>2. Click icon "Thùng rác"<br>3. Popup hiện lên<br>4. Press phím `ESC` trên bàn phím<br>5. Kiểm tra kết quả | 1. Popup đóng lại<br>2. Không có API DELETE được gọi<br>3. Sản phẩm không bị xóa<br>4. No side effects | None | Product ID: 1<br>Action: Press ESC key | | | Related: [FE_CART-15]<br>Keyboard: ESC |
| SYSTEM_CART_OFFLINE_01 | Offline Before Action | Xử lý khi offline trước khi thao tác | 1. Login và có sản phẩm trong giỏ<br>2. Mở DevTools → Network tab<br>3. Toggle "Offline" mode<br>4. Thử tăng số lượng sản phẩm<br>5. Thử xóa sản phẩm<br>6. Thử apply mã giảm giá | 1. Hiển thị Toast: "Không có kết nối mạng"<br>2. Các nút bị disable hoặc hiển thị icon offline<br>3. Không có API call nào được gửi<br>4. UI không crash<br>5. Error message rõ ràng | None | Network: Offline<br>Product ID: 1 | | | Related: [FE_CART-29]<br>Priority: P0 (Critical) |
| SYSTEM_CART_OFFLINE_02 | Offline During Action | Mất mạng trong khi request đang gửi | 1. Login và có sản phẩm trong giỏ<br>2. Click tăng số lượng<br>3. Ngay lập tức ngắt mạng (tắt Wifi)<br>4. Đợi request timeout<br>5. Kiểm tra UI response | 1. Request timeout hoặc fail<br>2. Hiển thị error: "Kết nối bị gián đoạn"<br>3. UI rollback về trạng thái cũ (nếu optimistic update)<br>4. Không bị infinite loading | None | Network: Disconnect during request<br>Timeout: 5s | | | Related: [FE_CART-29]<br>Test network interruption |
| SYSTEM_CART_OFFLINE_03 | Reconnect After Offline | Kết nối lại sau khi offline | 1. Trong trạng thái offline (từ SYSTEM_CART_OFFLINE_01)<br>2. Bật lại mạng (Online mode)<br>3. Thử tăng số lượng sản phẩm<br>4. Kiểm tra API call thành công | 1. Hiển thị "Đã kết nối lại"<br>2. Các nút được enable trở lại<br>3. API call thành công (200 OK)<br>4. UI cập nhật đúng<br>5. Auto-retry pending requests (optional) | SYSTEM_CART_OFFLINE_01 | Network: Online again<br>Product ID: 1 | | | Related: [FE_CART-29]<br>Test reconnection |
| SYSTEM_CART_CROSS_BROWSER_01 | Chrome Compatibility | Kiểm tra tương thích trên Chrome | 1. Mở Chrome browser (latest)<br>2. Test các chức năng: Add to cart, Remove, Quantity change, Promo code, Checkout<br>3. Kiểm tra UI rendering<br>4. Test responsive design | 1. Tất cả chức năng hoạt động bình thường<br>2. UI hiển thị chính xác<br>3. No console errors<br>4. Performance tốt | None | Browser: Chrome (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_CART_CROSS_BROWSER_02 | Firefox Compatibility | Kiểm tra tương thích trên Firefox | 1. Mở Firefox browser (latest)<br>2. Test các chức năng cart<br>3. Kiểm tra input type="number" behavior<br>4. Test modal interactions | 1. Tất cả chức năng OK<br>2. UI render đúng<br>3. Input behavior correct<br>4. No Firefox-specific bugs | None | Browser: Firefox (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_CART_CROSS_BROWSER_03 | Safari Compatibility | Kiểm tra tương thích trên Safari | 1. Mở Safari browser (14+)<br>2. Test cart features<br>3. **Đặc biệt**: Test input type="number" UX<br>4. Test modal overlay click | 1. Chức năng hoạt động<br>2. Input có thể khác UX (Safari style)<br>3. Modal overlay click works<br>4. Document Safari-specific behavior | None | Browser: Safari 14+<br>OS: macOS | | | ⚠️ Safari input UX may differ |
| SYSTEM_CART_MOBILE_01 | iPhone Responsiveness | Kiểm tra responsive trên iPhone | 1. Mở Chrome DevTools<br>2. Select device: iPhone 14 Pro (390x844)<br>3. Test touch interactions: Tap to remove, swipe gestures<br>4. Test modal popup size<br>5. Kiểm tra checkout button visibility | 1. Modal popup fit màn hình nhỏ<br>2. Touch gestures hoạt động mượt<br>3. Quantity input với mobile keyboard OK<br>4. Checkout button sticky footer visible<br>5. No horizontal scroll | None | Device: iPhone 14 Pro<br>Viewport: 390x844<br>OS: iOS 17 | | | Mobile testing |
| SYSTEM_CART_MOBILE_02 | Android Responsiveness | Kiểm tra responsive trên Android | 1. Select device: Samsung Galaxy S23<br>2. Test cart features on mobile<br>3. Test keyboard behavior<br>4. Test swipe gestures | 1. UI responsive đúng<br>2. Keyboard không che nút<br>3. Gestures work<br>4. Performance tốt | None | Device: Samsung Galaxy S23<br>OS: Android 13 | | | Mobile testing |
| SYSTEM_CART_MOBILE_03 | Tablet Responsiveness | Kiểm tra responsive trên Tablet | 1. Select device: iPad Pro (1024x1366)<br>2. Test cart layout<br>3. Test touch interactions<br>4. Verify grid/list view | 1. Layout tận dụng không gian tablet<br>2. Touch target đủ lớn (44x44px)<br>3. Modal centered và không quá nhỏ<br>4. UI không bị stretched | None | Device: iPad Pro<br>Viewport: 1024x1366<br>OS: iPadOS 17 | | | Tablet testing |
| SYSTEM_CART_PERF_01 | Cart with 100+ Items | Kiểm tra performance với giỏ hàng lớn | 1. Seed database với 100 products<br>2. Add all 100 products vào cart<br>3. Test scroll performance<br>4. Test quantity change<br>5. Measure page load time | 1. Page load time < 3s<br>2. Scroll mượt (60fps)<br>3. Quantity change debounced<br>4. No UI lag/freeze<br>5. API response < 500ms | None | Products: 100 items<br>Total cart value: Large | | | Performance test<br>Use virtual scroll |
| SYSTEM_CART_PERF_02 | Slow 3G Network | Kiểm tra debounce trên mạng chậm | 1. DevTools → Network → Throttling: Slow 3G<br>2. Click tăng số lượng 5 lần nhanh<br>3. Quan sát debounce behavior<br>4. Kiểm tra API calls | 1. Chỉ 1 request được gửi (debounced)<br>2. UI hiển thị loading indicator<br>3. Request timeout hợp lý (10s)<br>4. User không thể spam click | None | Network: Slow 3G (400kbps)<br>Latency: 2000ms | | | Performance under slow network |
| SYSTEM_CART_PERF_03 | API Response Time | Đo thời gian phản hồi API | 1. Use Postman/Playwright to measure API<br>2. GET /api/cart (with 10 items)<br>3. PUT /api/cart/update (quantity change)<br>4. DELETE /api/cart/delete<br>5. Record response times | 1. GET /api/cart: < 500ms<br>2. PUT update: < 300ms<br>3. DELETE: < 200ms<br>4. All endpoints fast<br>5. No timeout errors | None | Metric: Response time<br>Target: < 500ms | | | API performance benchmark |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Cart System Tests', () => {
  it('[SYSTEM_CART_DEBOUNCE_01] Rapid click debounce', () => {
    cy.intercept('PUT', '/api/cart/update').as('updateCart');
    cy.visit('/cart');
    
    // Click 10 times rapidly
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="increase-qty-1"]').click();
    }
    
    cy.wait(1000); // Debounce timer
    cy.get('@updateCart.all').should('have.length', 1);
    cy.get('@updateCart').its('request.body.quantity').should('eq', 11);
  });

  it('[SYSTEM_CART_MODAL_03] Close modal by ESC key', () => {
    cy.visit('/cart');
    cy.get('[data-testid="delete-product-1"]').click();
    cy.get('.modal').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('.modal').should('not.be.visible');
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_CART_OFFLINE_01] Offline before action', async ({ page, context }) => {
  await page.goto('/cart');
  
  // Set offline mode
  await context.setOffline(true);
  
  // Try to increase quantity
  await page.click('[data-testid="increase-qty-1"]');
  await page.waitForTimeout(1000);
  
  // Assert error message
  await expect(page.locator('.toast-error')).toContainText('Không có kết nối mạng');
  
  // Assert quantity unchanged
  await expect(page.locator('[data-testid="quantity-1"]')).toContainText('1');
});

test('[SYSTEM_CART_OFFLINE_03] Reconnect after offline', async ({ page, context }) => {
  await page.goto('/cart');
  await context.setOffline(true);
  
  // Try action while offline (should fail)
  await page.click('[data-testid="increase-qty-1"]');
  
  // Reconnect
  await context.setOffline(false);
  
  // Retry action
  await page.click('[data-testid="increase-qty-1"]');
  await page.waitForResponse(response => 
    response.url().includes('/cart/update') && response.status() === 200
  );
  
  // Success
  await expect(page.locator('[data-testid="quantity-1"]')).toContainText('2');
});
```

---

## Test Execution Commands

```bash
# Run all cart system tests (Cypress)
npx cypress run --spec "cypress/e2e/cart.system.cy.js"

# Run specific test (Playwright)
npx playwright test --grep "SYSTEM_CART_DEBOUNCE"

# Run offline tests only
npx playwright test --grep "OFFLINE"

# Cross-browser testing
npx playwright test cart.system.spec.ts --project=chromium --project=firefox --project=webkit

# Mobile testing
npx playwright test --project=mobile-chrome --project=mobile-safari

# Performance testing with report
npx playwright test --grep "PERF" --reporter=html
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Add to Cart | ✅ | ✅ | ✅ | ✅ |
| Remove Item | ✅ | ✅ | ✅ | ✅ |
| Quantity Change | ✅ | ✅ | ⚠️ Input UX | ✅ |
| Promo Code | ✅ | ✅ | ✅ | ✅ |
| Checkout | ✅ | ✅ | ✅ | ✅ |
| Modal Close | ✅ | ✅ | ✅ | ✅ |
| Debounce | ✅ | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | ✅ | ⚠️ ServiceWorker | ✅ |

**Legend:**
- ✅ Fully supported
- ⚠️ Works with minor differences (documented in Note column)

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 3s | Lighthouse / WebPageTest |
| API response time | < 500ms | Network tab / Postman |
| UI interaction response | < 100ms | User perception |
| Debounce delay | 300ms | Code implementation |
| Cart with 100 items | < 5s load | Performance test |
| Offline detection | < 1s | Network state change |

---

## Test Environment Setup

### Docker Compose
```yaml
services:
  frontend:
    image: cart-frontend:test
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://backend:4000
  
  backend:
    image: cart-backend:test
    ports:
      - "4000:4000"
    environment:
      - DB_HOST=test-db
  
  test-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=cart_test
```

### Test Data Seed
```sql
-- Insert test user
INSERT INTO users (email, password) VALUES ('user@example.com', 'hashed_password');

-- Insert 100 products for performance testing
INSERT INTO products (name, price, stock)
SELECT 
  'Product ' || generate_series,
  random() * 1000000,
  100
FROM generate_series(1, 100);
```

---

## Manual Testing Steps

### Offline Mode Testing

**Method 1: Chrome DevTools**
```
1. F12 → Network tab
2. Throttling dropdown → Offline
3. Perform actions
4. Toggle back to "Online"
```

**Method 2: OS Level (Windows)**
```
1. Control Panel → Network and Sharing Center
2. Change adapter settings
3. Right-click → Disable
4. (Re-enable after test)
```

**Method 3: OS Level (Mac)**
```
1. System Preferences → Network
2. Turn Wi-Fi Off
3. (Turn back on after test)
```

---

## Test Prioritization

### P0 (Critical) - Must Pass Before Release
- SYSTEM_CART_DEBOUNCE_01 (prevents server overload)
- SYSTEM_CART_OFFLINE_01 (UX critical, no crash)

### P1 (High) - Important User Flows
- SYSTEM_CART_MODAL_01, 02, 03 (common user flow)
- SYSTEM_CART_OFFLINE_03 (reconnection recovery)

### P2 (Medium) - Quality Assurance
- SYSTEM_CART_CROSS_BROWSER_01, 02, 03
- SYSTEM_CART_MOBILE_01, 02, 03

### P3 (Low) - Nice to Have
- SYSTEM_CART_PERF_01, 02, 03 (optimization)

---

## Notes

- Execute in **staging environment only**, never production
- Use isolated test database that can be reset
- For offline tests, ensure proper cleanup (re-enable network)
- Performance tests should run during off-peak hours
- Mobile tests: Use real devices when possible for touch accuracy
- Document browser-specific issues with screenshots and console logs
- Debounce timer (300ms) is configurable via environment variable

---

## Related Documents

- [Unit Test Spec](../unit-test/cart.unit.spec.ts)
- [Integration Test Spec](../integration-test/cart.it.spec.ts)
- [API Documentation](../../../Backend/docs/cart-api.md)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Maintained By**: QA Automation Team
