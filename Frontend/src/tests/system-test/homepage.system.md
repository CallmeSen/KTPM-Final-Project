# System Test Cases - Homepage Module

**Project:** KTPM-Final-Project  
**Module:** Homepage  
**Test Type:** System Test / End-to-End Test  
**Framework Recommendation:** Cypress / Playwright  
**Generated Date:** December 17, 2025

---

## Overview

These test cases represent **End-to-End (E2E) scenarios** that require:
- Real browser interaction
- Browser navigation controls (Back/Forward buttons)
- Multi-tab synchronization
- Session management across browser instances

These tests should be executed manually or using E2E automation frameworks like **Cypress**, **Playwright**, or **Selenium**.

---

## Test Cases

### 1. [FE_HOME-13] FE_HOME_Logout_BackButton
**Test Case Name:** Kiểm tra nút Back sau khi Logout

**Description:**  
Kiểm tra hành vi của trình duyệt khi user nhấn nút "Back" sau khi đã logout, đảm bảo không thể quay lại các trang yêu cầu authentication.

**Test Procedure:**
1. **Login:**
   - Mở trình duyệt và truy cập trang login (`/auth/login`)
   - Đăng nhập với tài khoản hợp lệ (VD: `user@example.com` / `password123`)
   - Xác nhận đã login thành công (redirect về `/home` hoặc `/profile`)

2. **Navigate:**
   - Sau khi login, truy cập các trang yêu cầu authentication:
     - `/profile` (Trang cá nhân)
     - `/cart` (Giỏ hàng)
     - `/orders` (Đơn hàng)
   - Xác nhận các trang hiển thị đúng dữ liệu user

3. **Logout:**
   - Click nút "Logout" trên header/menu
   - Đợi hệ thống chuyển về trang Login hoặc Homepage

4. **Test Back Button:**
   - Nhấn nút "Back" (← ) trên trình duyệt
   - Hoặc sử dụng phím tắt: `Alt + ←` (Windows) / `Cmd + [` (Mac)

**Expected Output:**
1. **Không quay lại được trang cũ:**
   - Browser không hiển thị lại trang `/profile` hoặc `/cart`
   - Hoặc nếu quay lại, trang tự động redirect về `/auth/login`

2. **Redirect về Login:**
   - Hệ thống phát hiện không có session/token
   - Tự động chuyển hướng về trang Login
   - Hiển thị thông báo: "Vui lòng đăng nhập để tiếp tục" (optional)

3. **Security Check:**
   - Không lộ dữ liệu user trên các trang yêu cầu authentication
   - Token đã bị xóa khỏi localStorage/cookie

**Test Data:**
- User: `user@example.com`
- Password: `password123`

**Prerequisites:**
- User đã đăng ký tài khoản
- Backend hỗ trợ session/token validation
- Frontend có middleware/guard kiểm tra authentication

**Test Environment:**
- Browser: Chrome, Firefox, Edge, Safari
- Device: Desktop (Windows/Mac)
- Network: Online

**Pass Criteria:**
- ✅ Không thể quay lại trang yêu cầu auth sau khi logout
- ✅ Tự động redirect về Login
- ✅ Không có lỗi console (Uncaught Exception)

**Fail Criteria:**
- ❌ Có thể xem lại trang `/profile` với dữ liệu user
- ❌ Không redirect về Login
- ❌ Lỗi JavaScript trong console

---

### 2. [FE_HOME-14] FE_HOME_Logout_MultiTab
**Test Case Name:** Đồng bộ Logout giữa các Tab

**Description:**  
Kiểm tra tính năng đồng bộ session khi user logout trên một tab, các tab khác cũng phải tự động logout hoặc nhận thông báo session hết hạn.

**Test Procedure:**
1. **Setup Multi-Tab:**
   - Mở trình duyệt Chrome/Firefox
   - Mở **Tab A**: Truy cập và login vào trang `/home`
   - Mở **Tab B**: Truy cập `/profile` (với cùng session)
   - Mở **Tab C**: Truy cập `/cart` (với cùng session)
   - Xác nhận cả 3 tab đều hiển thị đúng dữ liệu user đã login

2. **Logout on Tab A:**
   - Chuyển sang **Tab A**
   - Click nút "Logout"
   - Đợi Tab A redirect về trang Login

3. **Check Tab B:**
   - Chuyển sang **Tab B** (đang ở trang `/profile`)
   - **Option 1:** Click vào bất kỳ element nào trên trang (trigger re-render)
   - **Option 2:** Refresh trang (F5)
   - Quan sát phản ứng của hệ thống

4. **Check Tab C:**
   - Chuyển sang **Tab C** (đang ở trang `/cart`)
   - Thực hiện thao tác: Thêm sản phẩm, hoặc refresh
   - Quan sát phản ứng của hệ thống

**Expected Output:**

**Approach 1: Automatic Sync (Recommended)**
1. **Tab A:** Logout thành công → Redirect về `/auth/login`
2. **Tab B & C:** 
   - Tự động phát hiện session đã bị xóa (qua `storage` event listener)
   - Hiển thị popup/notification: "Phiên đăng nhập đã hết hạn"
   - Tự động redirect về `/auth/login` sau 3 giây
   - Hoặc redirect ngay lập tức

**Approach 2: Lazy Check (Acceptable)**
1. **Tab A:** Logout thành công
2. **Tab B & C:**
   - Khi user refresh hoặc thực hiện action (API call)
   - Backend trả về 401 Unauthorized (token không hợp lệ)
   - Frontend bắt lỗi 401 → Redirect về Login
   - Hiển thị thông báo: "Phiên đăng nhập đã hết hạn"

**Verification Points:**
- Kiểm tra `localStorage` trên cả 3 tab: token/session đã bị xóa
- Không có tab nào còn giữ trạng thái "đã đăng nhập"
- Không thể thực hiện action yêu cầu authentication (Add to cart, Update profile)

**Test Data:**
- User: `user@example.com`
- Browser Tabs: 3 tabs (A, B, C)

**Prerequisites:**
- Frontend sử dụng `localStorage` hoặc `sessionStorage` để lưu token
- Có implement `window.addEventListener('storage', ...)` để đồng bộ giữa các tab
- Backend validate token cho mỗi API request

**Test Environment:**
- Browser: Chrome (latest), Firefox (latest)
- Device: Desktop
- Network: Online

**Implementation Hint (for Developers):**

```typescript
// Listen for storage changes across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'token' && event.newValue === null) {
    // Token was removed (logout happened in another tab)
    showNotification('Phiên đăng nhập đã hết hạn');
    setTimeout(() => {
      router.push('/auth/login');
    }, 3000);
  }
});
```

**Pass Criteria:**
- ✅ Tab B và C tự động logout hoặc redirect về Login
- ✅ Không thể thực hiện action yêu cầu auth trên các tab khác
- ✅ User nhận được thông báo rõ ràng

**Fail Criteria:**
- ❌ Tab B và C vẫn hiển thị trạng thái đã đăng nhập
- ❌ Có thể thực hiện action (Add to cart) thành công
- ❌ Không có thông báo nào

---

## Execution Recommendations

### Manual Testing Steps

1. **Environment Setup:**
   - Use incognito/private mode to avoid cache conflicts
   - Clear browser cache and cookies before each test
   - Ensure backend is running in development/staging environment

2. **Documentation:**
   - Record screen during test execution (OBS, QuickTime)
   - Take screenshots of each critical step
   - Document actual behavior vs expected behavior

3. **Browser Testing Matrix:**
   
   | Test Case | Chrome | Firefox | Safari | Edge |
   |-----------|--------|---------|--------|------|
   | FE_HOME-13 | ✅ | ✅ | ✅ | ✅ |
   | FE_HOME-14 | ✅ | ✅ | ⚠️ | ✅ |
   
   ⚠️ Safari has different behavior for localStorage events between tabs

---

### E2E Automation (Cypress Example)

```typescript
describe('Homepage - System Tests', () => {

  describe('[FE_HOME-13] Logout Back Button', () => {
    it('should not allow back navigation to protected pages after logout', () => {
      // Login
      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('user@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/home');

      // Navigate to protected page
      cy.visit('/profile');
      cy.contains('My Profile').should('be.visible');

      // Logout
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/auth/login');

      // Try to go back
      cy.go('back');

      // Should redirect back to login
      cy.url().should('include', '/auth/login');
      cy.contains('My Profile').should('not.exist');
    });
  });

  describe('[FE_HOME-14] Multi-Tab Logout Sync', () => {
    it('should logout user in all tabs when logout in one tab', () => {
      // Note: Cypress doesn't support real multi-tab testing
      // This is a simulated approach
      
      // Login
      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('user@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Simulate logout in another tab by clearing localStorage
      cy.window().then((win) => {
        win.localStorage.removeItem('token');
        win.localStorage.removeItem('session');
        
        // Trigger storage event manually
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'token',
          oldValue: 'some-token',
          newValue: null
        }));
      });

      // Wait for notification or redirect
      cy.contains('Phiên đăng nhập đã hết hạn', { timeout: 5000 })
        .should('be.visible');
      
      cy.url({ timeout: 10000 }).should('include', '/auth/login');
    });
  });
});
```

---

### Playwright Example (Better for Multi-Tab)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage - System Tests', () => {

  test('[FE_HOME-14] Multi-Tab Logout Sync', async ({ browser }) => {
    const context = await browser.newContext();
    
    // Create 3 tabs
    const tabA = await context.newPage();
    const tabB = await context.newPage();
    const tabC = await context.newPage();

    // Login in Tab A
    await tabA.goto('/auth/login');
    await tabA.fill('input[name="email"]', 'user@example.com');
    await tabA.fill('input[name="password"]', 'password123');
    await tabA.click('button[type="submit"]');
    await expect(tabA).toHaveURL(/.*home/);

    // Navigate Tab B to profile
    await tabB.goto('/profile');
    await expect(tabB.locator('text=My Profile')).toBeVisible();

    // Navigate Tab C to cart
    await tabC.goto('/cart');
    await expect(tabC.locator('text=Shopping Cart')).toBeVisible();

    // Logout in Tab A
    await tabA.click('[data-testid="logout-button"]');
    await expect(tabA).toHaveURL(/.*login/);

    // Wait a bit for storage event to propagate
    await tabB.waitForTimeout(1000);

    // Refresh Tab B and check redirect
    await tabB.reload();
    await expect(tabB).toHaveURL(/.*login/);

    // Refresh Tab C and check redirect
    await tabC.reload();
    await expect(tabC).toHaveURL(/.*login/);

    await context.close();
  });
});
```

---

## Test Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Browsers** | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| **Devices** | Desktop (1920x1080, 1366x768) |
| **OS** | Windows 10+, macOS 12+, Linux (Ubuntu 22.04) |
| **Network** | Stable Wifi (10+ Mbps) |
| **Backend** | Staging server with test database |
| **Test Users** | 2-3 test accounts with different roles |

---

## Known Issues & Edge Cases

### Browser-Specific Behavior

1. **Safari:**
   - `storage` event may not fire reliably between tabs
   - May need polling approach to check localStorage changes

2. **Firefox:**
   - Private browsing mode blocks some storage events
   - Test in normal mode first

3. **Chrome:**
   - Incognito tabs don't share localStorage with normal tabs
   - Ensure all test tabs are in same mode

### Fallback Strategies

If automatic sync doesn't work:
- Implement API polling (check session validity every 30s)
- Use BroadcastChannel API for cross-tab communication
- Fallback to lazy check on user interaction

---

## Related Documents

- [Unit Test Spec](../unit-test/homepage.unit.spec.ts)
- [Integration Test Spec](../integration-test/homepage.it.spec.ts)
- [Authentication Flow Documentation](../../../docs/auth-flow.md)

---

## Notes for QA Team

- System tests should run in **staging environment only**
- Use real test accounts (not production users)
- Document any browser-specific failures
- Report timing issues (race conditions in multi-tab tests)
- Test on slow network connections (throttle to 3G)

---

**Last Updated:** December 17, 2025  
**Maintained By:** QA Automation Team
