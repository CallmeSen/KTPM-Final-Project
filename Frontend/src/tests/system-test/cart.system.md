# System Test Cases - Cart Module

**Project:** KTPM-Final-Project  
**Module:** Cart (Shopping Cart)  
**Test Type:** System Test / End-to-End Test  
**Framework Recommendation:** Cypress / Playwright  
**Generated Date:** December 18, 2025

---

## Overview

These test cases represent **End-to-End (E2E) scenarios** that require:
- Real browser interaction with UI elements
- Network monitoring (debounce testing)
- Offline mode simulation
- Modal/popup interactions
- Real-time UI updates

These tests should be executed manually or using E2E automation frameworks like **Cypress**, **Playwright**, or **Selenium**.

---

## Test Cases

### 1. [FE_CART-11] FE_CART_QtyChange_Debounce
**Test Case Name:** Kiểm thử gọi hàm liên tục (Debounce Testing)

**Description:**  
Kiểm tra cơ chế debounce khi user thao tác nhanh liên tục, đảm bảo không gửi quá nhiều API requests.

**Test Procedure:**
1. **Setup:**
   - Login và thêm sản phẩm vào giỏ hàng
   - Mở DevTools → Network tab
   - Filter theo endpoint `/api/cart` hoặc `/api/cart/update`

2. **Execute:**
   - Tại một sản phẩm trong giỏ, click nút "Tăng (+)" **10 lần liên tiếp** trong vòng 1 giây
   - Hoặc sử dụng automation script để click nhanh

3. **Monitor:**
   - Quan sát Network tab
   - Đếm số lượng request được gửi đi

**Expected Output:**
1. **Debounce Success:**
   - Chỉ có **1 request** cuối cùng được gửi đi (với số lượng mới nhất: +10)
   - KHÔNG gửi 10 requests riêng lẻ

2. **Performance:**
   - UI không bị lag/freeze
   - Số lượng hiển thị cập nhật mượt mà

3. **Server Load:**
   - Backend không nhận 10 requests đồng thời
   - Giảm tải cho server

**Test Data:**
- Product ID: Any
- Initial Quantity: 1
- Clicks: 10 times in 1 second

**Prerequisites:**
- Product có stock đủ lớn (>= 11)
- Debounce timer được cấu hình (thường 300-500ms)

**Test Environment:**
- Browser: Chrome (latest) with DevTools
- Network: Throttling to Fast 3G (optional - test under slow network)
- Device: Desktop

**Automation Script (Cypress):**

```typescript
describe('[FE_CART-11] Debounce Test', () => {
  it('should send only 1 API request when clicking rapidly', () => {
    cy.intercept('PUT', '/api/cart/update').as('updateCart');
    
    cy.visit('/cart');
    
    // Click increase button 10 times rapidly
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="increase-qty-1"]').click();
    }
    
    // Wait for debounce timer
    cy.wait(1000);
    
    // Check that only 1 request was sent
    cy.get('@updateCart.all').should('have.length', 1);
    
    // Verify the final quantity is correct
    cy.get('@updateCart').its('request.body.quantity').should('eq', 11);
  });
});
```

**Pass Criteria:**
- ✅ Chỉ có 1 API request trong Network tab
- ✅ Request cuối cùng chứa số lượng chính xác
- ✅ UI cập nhật đúng giá trị

**Fail Criteria:**
- ❌ Có 2+ requests được gửi đi
- ❌ UI bị lag hoặc crash
- ❌ Số lượng cuối cùng không đúng

---

### 2. [FE_CART-15] FE_CART_Remove_CloseModal
**Test Case Name:** Đóng popup xác nhận (UI Testing)

**Description:**  
Kiểm tra các cách đóng modal xác nhận xóa sản phẩm mà không thực hiện action.

**Test Procedure:**

**Test Case A: Click Overlay**
1. Click icon "Thùng rác" tại một sản phẩm
2. Popup xác nhận hiện lên với overlay tối phía sau
3. Click vào vùng tối (overlay) bên ngoài popup

**Test Case B: Click X Button**
1. Click icon "Thùng rác"
2. Popup hiện lên
3. Click nút X (close button) ở góc popup

**Test Case C: Press ESC Key**
1. Click icon "Thùng rác"
2. Popup hiện lên
3. Press phím `ESC` trên bàn phím

**Expected Output:**
1. **Popup đóng lại** trong tất cả các trường hợp
2. **Không có hành động nào được thực thi:**
   - Sản phẩm vẫn còn trong danh sách
   - Không có API DELETE được gọi
   - Tổng tiền không thay đổi

**Test Data:**
- Product: Any product in cart

**Prerequisites:**
- Cart có ít nhất 1 sản phẩm

**Test Environment:**
- Browser: Chrome, Firefox, Safari
- Device: Desktop, Mobile

**Automation Script (Playwright):**

```typescript
test('[FE_CART-15] Close modal by clicking overlay', async ({ page }) => {
  await page.goto('/cart');
  
  // Setup network spy
  const deleteRequests = [];
  page.on('request', request => {
    if (request.method() === 'DELETE' && request.url().includes('/cart')) {
      deleteRequests.push(request);
    }
  });
  
  // Click delete button
  await page.click('[data-testid="delete-product-1"]');
  
  // Wait for modal
  await page.waitForSelector('.modal');
  
  // Click overlay (outside modal)
  await page.click('.modal-overlay', { position: { x: 10, y: 10 } });
  
  // Assert modal is closed
  await expect(page.locator('.modal')).not.toBeVisible();
  
  // Assert no DELETE request was sent
  expect(deleteRequests.length).toBe(0);
  
  // Assert product still exists
  await expect(page.locator('[data-product-id="1"]')).toBeVisible();
});

test('[FE_CART-15] Close modal by ESC key', async ({ page }) => {
  await page.goto('/cart');
  
  await page.click('[data-testid="delete-product-1"]');
  await page.waitForSelector('.modal');
  
  // Press ESC key
  await page.keyboard.press('Escape');
  
  // Assert modal is closed
  await expect(page.locator('.modal')).not.toBeVisible();
});
```

**Pass Criteria:**
- ✅ Modal đóng khi click overlay, X, hoặc ESC
- ✅ Không có API DELETE được gọi
- ✅ Sản phẩm vẫn còn trong cart

**Fail Criteria:**
- ❌ Modal không đóng
- ❌ Có API DELETE được gửi đi
- ❌ Sản phẩm bị xóa khỏi UI

---

### 3. [FE_CART-29] FE_CART_Offline_Mode
**Test Case Name:** Xử lý khi mất mạng (Offline Mode)

**Description:**  
Kiểm tra hành vi của ứng dụng khi mất kết nối internet, đảm bảo UX tốt và không bị crash.

**Test Procedure:**

**Setup:**
1. Login và có sản phẩm trong giỏ hàng
2. Đảm bảo ứng dụng đang hoạt động bình thường

**Test Scenario A: Offline Before Action**
1. **Mở DevTools → Network tab**
2. **Toggle "Offline" mode** (hoặc Throttling → Offline)
3. Thử tăng/giảm số lượng sản phẩm
4. Thử xóa sản phẩm
5. Thử apply mã giảm giá

**Test Scenario B: Offline During Action**
1. Click tăng số lượng
2. Trong khi request đang gửi đi, **ngắt mạng** (tắt Wifi/rút cáp mạng)
3. Đợi request timeout

**Test Scenario C: Reconnect**
1. Sau khi offline, **bật lại mạng**
2. Thử thao tác lại (tăng số lượng)

**Expected Output:**

**Approach 1: Block Actions (Recommended for Critical Operations)**
1. **Hiển thị thông báo:**
   - Toast/Alert: "Không có kết nối mạng"
   - "Vui lòng kiểm tra kết nối internet của bạn"

2. **Chặn thao tác:**
   - Không cho phép tăng/giảm số lượng
   - Disable các nút action
   - Hiển thị icon mất mạng trên UI

3. **Sau khi reconnect:**
   - Auto-retry request (optional)
   - Hiển thị "Đã kết nối lại"
   - Enable lại các nút

**Approach 2: Optimistic Update (Advanced)**
1. **Cập nhật UI trước:**
   - Tăng số lượng ngay trên UI (giả lập thành công)
   - Hiển thị loading indicator

2. **Sync sau:**
   - Khi có mạng trở lại, gửi request sync
   - Nếu sync fail, rollback UI về trạng thái cũ

3. **Thông báo:**
   - "Thay đổi sẽ được lưu khi có kết nối"

**Test Data:**
- Network: Offline
- Product: Any

**Prerequisites:**
- Có quyền control network (DevTools hoặc OS level)

**Test Environment:**
- Browser: Chrome, Firefox (with DevTools)
- Network: Simulated offline mode
- Device: Desktop, Mobile

**Automation Script (Playwright - Network Interception):**

```typescript
test('[FE_CART-29] Handle offline mode gracefully', async ({ page, context }) => {
  await page.goto('/cart');
  
  // Simulate offline mode
  await context.setOffline(true);
  
  // Try to increase quantity
  await page.click('[data-testid="increase-qty-1"]');
  
  // Wait a bit for error handling
  await page.waitForTimeout(1000);
  
  // Assert error message is shown
  await expect(page.locator('.toast-error')).toContainText('Không có kết nối mạng');
  
  // Assert quantity didn't change (or reverted if optimistic update)
  const quantity = await page.locator('[data-testid="quantity-1"]').textContent();
  expect(quantity).toBe('1'); // Original value
  
  // Reconnect
  await context.setOffline(false);
  
  // Try action again
  await page.click('[data-testid="increase-qty-1"]');
  
  // Should work now
  await page.waitForResponse(response => 
    response.url().includes('/cart/update') && response.status() === 200
  );
  
  // Assert success
  await expect(page.locator('[data-testid="quantity-1"]')).toContainText('2');
});
```

**Manual Testing Steps:**

1. **Using Chrome DevTools:**
   ```
   F12 → Network tab → Throttling dropdown → Offline
   ```

2. **Using Browser Extension:**
   - Install "Offline Simulator" extension
   - Toggle offline mode

3. **OS Level (Windows):**
   ```
   Control Panel → Network → Disable adapter
   ```

4. **OS Level (Mac):**
   ```
   System Preferences → Network → Turn Wi-Fi Off
   ```

**Pass Criteria:**
- ✅ Hiển thị thông báo rõ ràng khi offline
- ✅ Không crash hoặc báo lỗi khó hiểu
- ✅ UI vẫn hoạt động (readonly mode hoặc optimistic update)
- ✅ Auto-retry hoặc cho phép manual retry sau khi online

**Fail Criteria:**
- ❌ Không có thông báo gì
- ❌ UI bị crash hoặc infinite loading
- ❌ Console log lỗi uncaught error
- ❌ Không thể thao tác được sau khi online lại

---

## Additional System Test Scenarios

### 4. Cross-Browser Compatibility

**Test Matrix:**

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Add to Cart | ✅ | ✅ | ✅ | ✅ |
| Remove Item | ✅ | ✅ | ✅ | ✅ |
| Quantity Change | ✅ | ✅ | ⚠️ | ✅ |
| Promo Code | ✅ | ✅ | ✅ | ✅ |
| Checkout | ✅ | ✅ | ✅ | ✅ |

⚠️ Safari: Test input type="number" behavior (may have different UX)

---

### 5. Mobile Responsiveness

**Test Devices:**
- iPhone 14 Pro (iOS 17)
- Samsung Galaxy S23 (Android 13)
- iPad Pro (iPadOS 17)

**Test Points:**
- Touch interactions (tap to remove, swipe gestures)
- Modal popup size on small screens
- Quantity input on mobile keyboard
- Checkout button visibility (sticky footer)

---

### 6. Performance Testing

**Load Testing:**
- Cart with 100+ items
- Multiple users updating cart simultaneously
- Debounce under slow 3G network

**Metrics:**
- Page load time: < 3s
- API response time: < 500ms
- UI interaction response: < 100ms

---

## Execution Recommendations

### Test Prioritization

**P0 (Critical):**
- [FE_CART-11] Debounce (prevents server overload)
- [FE_CART-29] Offline mode (UX critical)

**P1 (High):**
- [FE_CART-15] Modal interactions (common user flow)

**P2 (Medium):**
- Cross-browser testing
- Mobile responsiveness

### Test Environment Setup

```yaml
# Docker Compose for E2E Testing
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

---

## Related Documents

- [Unit Test Spec](../unit-test/cart.unit.spec.ts)
- [Integration Test Spec](../integration-test/cart.it.spec.ts)
- [API Documentation](../../../Backend/docs/cart-api.md)

---

**Last Updated:** December 18, 2025  
**Maintained By:** QA Automation Team
