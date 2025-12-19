# Homepage Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Homepage Module in standardized table format.

**Module:** Homepage  
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
defaultCommandTimeout: 10000ms
```

### Test Prerequisites
- User account: user@example.com / password123
- Token expiry time: 30 minutes (configurable)
- Protected routes: `/profile`, `/cart`, `/orders`

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_HOME_LOGOUT_01 | Logout Back Button Prevention | Kiểm tra nút Back sau khi Logout | 1. Login với `user@example.com` / `password123`<br>2. Xác nhận redirect về `/home` hoặc `/profile`<br>3. Navigate to protected pages: `/profile`, `/cart`, `/orders`<br>4. Click "Logout" button<br>5. Wait for redirect to `/auth/login`<br>6. Press browser Back button (← )<br>7. Verify không thể quay lại protected pages | 1. Không quay lại được `/profile` hoặc `/cart`<br>2. Hoặc nếu quay lại, auto redirect về `/auth/login`<br>3. Thông báo: "Vui lòng đăng nhập để tiếp tục"<br>4. Token đã bị xóa khỏi localStorage/cookie<br>5. Không lộ dữ liệu user<br>6. No console errors | None | User: user@example.com<br>Protected routes: /profile, /cart, /orders<br>Action: Back button after logout | | | Related: [FE_HOME-13]<br>Security: Prevent back navigation |
| SYSTEM_HOME_LOGOUT_02 | Multi-Tab Logout Sync | Đồng bộ Logout giữa các Tab | 1. Mở Browser Chrome/Firefox<br>2. **Tab A**: Login và truy cập `/home`<br>3. **Tab B**: Truy cập `/profile` (same session)<br>4. **Tab C**: Truy cập `/cart` (same session)<br>5. Xác nhận cả 3 tabs đều hiển thị user logged in<br>6. **Tab A**: Click "Logout"<br>7. **Tab B**: Click vào element hoặc refresh<br>8. **Tab C**: Thực hiện action (e.g., add to cart) | **Approach 1: Auto Sync (Recommended)**<br>1. Tab A logout → redirect `/auth/login`<br>2. Tab B & C auto detect session xóa (via storage event)<br>3. Popup: "Phiên đăng nhập đã hết hạn"<br>4. Auto redirect về `/auth/login` sau 3s<br><br>**Approach 2: Lazy Check**<br>1. Tab B & C: Khi refresh/action → API 401<br>2. Frontend bắt 401 → Redirect `/auth/login`<br>3. Message: "Phiên đăng nhập đã hết hạn" | None | Tabs: 3 tabs (A, B, C)<br>User: user@example.com<br>Sync method: Storage event listener | | | Related: [FE_HOME-14]<br>Use window.addEventListener('storage') |
| SYSTEM_HOME_BROWSER_01 | Chrome Compatibility | Test Homepage trên Chrome | 1. Mở Chrome browser (latest)<br>2. Test SYSTEM_HOME_LOGOUT_01<br>3. Test SYSTEM_HOME_LOGOUT_02<br>4. Check console errors<br>5. Verify all features | 1. Logout back button works ✅<br>2. Multi-tab sync works ✅<br>3. No console errors<br>4. Performance good | SYSTEM_HOME_LOGOUT_01, SYSTEM_HOME_LOGOUT_02 | Browser: Chrome (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_HOME_BROWSER_02 | Firefox Compatibility | Test Homepage trên Firefox | 1. Mở Firefox browser (latest)<br>2. Test logout features<br>3. Test multi-tab sync<br>4. Check storage event listener | 1. All features work ✅<br>2. Storage event fires correctly<br>3. No Firefox-specific bugs | SYSTEM_HOME_LOGOUT_01, SYSTEM_HOME_LOGOUT_02 | Browser: Firefox (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_HOME_BROWSER_03 | Safari Compatibility | Test Homepage trên Safari | 1. Mở Safari (14+)<br>2. Test features<br>3. **Note**: Storage event behavior may differ<br>4. Test in normal mode (not private) | 1. Features work ✅<br>2. **Safari**: Storage event may not fire reliably between tabs<br>3. May need polling approach<br>4. Document Safari differences | SYSTEM_HOME_LOGOUT_01, SYSTEM_HOME_LOGOUT_02 | Browser: Safari 14+<br>OS: macOS<br>⚠️ Storage event limitations | | | ⚠️ Safari: Storage event unreliable, use polling |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Homepage System Tests', () => {
  it('[SYSTEM_HOME_LOGOUT_01] Logout back button prevention', () => {
    // Login
    cy.visit('/auth/login');
    cy.get('[name="email"]').type('user@example.com');
    cy.get('[name="password"]').type('password123');
    cy.get('[type="submit"]').click();
    
    cy.url().should('include', '/home');
    
    // Visit protected page
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    
    // Logout
    cy.get('[data-testid="logout-btn"]').click();
    cy.url().should('include', '/auth/login');
    
    // Try to go back
    cy.go('back');
    
    // Should redirect to login or stay on login
    cy.url().should('include', '/auth/login');
    
    // Verify token removed
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_HOME_LOGOUT_02] Multi-tab logout sync', async ({ browser }) => {
  const context = await browser.newContext();
  
  // Tab A
  const pageA = await context.newPage();
  await pageA.goto('/auth/login');
  await pageA.fill('[name="email"]', 'user@example.com');
  await pageA.fill('[name="password"]', 'password123');
  await pageA.click('[type="submit"]');
  await pageA.waitForURL('**/home');
  
  // Tab B
  const pageB = await context.newPage();
  await pageB.goto('/profile');
  await expect(pageB.locator('[data-testid="user-info"]')).toBeVisible();
  
  // Tab C
  const pageC = await context.newPage();
  await pageC.goto('/cart');
  await expect(pageC.locator('[data-testid="cart"]')).toBeVisible();
  
  // Logout on Tab A
  await pageA.click('[data-testid="logout-btn"]');
  await pageA.waitForURL('**/auth/login');
  
  // Wait for storage event propagation
  await pageB.waitForTimeout(1000);
  
  // Tab B should detect logout
  // Option 1: Auto redirect (if storage event listener implemented)
  await expect(pageB).toHaveURL(/.*\/auth\/login/, { timeout: 5000 }).catch(async () => {
    // Option 2: Manual refresh triggers check
    await pageB.reload();
    await expect(pageB).toHaveURL(/.*\/auth\/login/);
  });
  
  // Tab C similar
  await pageC.reload();
  await expect(pageC).toHaveURL(/.*\/auth\/login/);
});

test('[SYSTEM_HOME_BROWSER_03] Safari storage event workaround', async ({ page }) => {
  // For Safari, use polling instead of storage event
  
  await page.addInitScript(() => {
    // Polling approach for Safari
    setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }, 2000); // Poll every 2 seconds
  });
  
  await page.goto('/auth/login');
  // ... rest of test
});
```

---

## Test Execution Commands

```bash
# Run all homepage system tests
npx cypress run --spec "cypress/e2e/homepage.system.cy.js"

# Run logout tests
npx playwright test --grep "SYSTEM_HOME_LOGOUT"

# Cross-browser testing
npx playwright test homepage.system.spec.ts --project=chromium --project=firefox --project=webkit

# Safari specific
npx playwright test --grep "SYSTEM_HOME_BROWSER_03" --project=webkit
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Logout Back Button | ✅ | ✅ | ✅ | ✅ |
| Multi-Tab Sync | ✅ | ✅ | ⚠️ Storage event | ✅ |
| Token Removal | ✅ | ✅ | ✅ | ✅ |
| Redirect Logic | ✅ | ✅ | ✅ | ✅ |

**Safari Notes:**
- `storage` event may not fire reliably between tabs
- Use polling approach: Check localStorage every 2-3 seconds
- Private browsing blocks some storage events
- Test in normal mode first

---

## Implementation Hints

### Storage Event Listener (for Multi-Tab Sync)
```typescript
// Frontend code
window.addEventListener('storage', (event) => {
  if (event.key === 'token' && event.newValue === null) {
    // Token was removed (logout in another tab)
    alert('Phiên đăng nhập đã hết hạn');
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 3000);
  }
});
```

### Fallback Strategies
1. **API Polling**: Check session validity every 30s
2. **BroadcastChannel API**: Cross-tab communication (modern browsers)
3. **Lazy Check**: On user interaction, verify token still valid

---

## Test Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Browsers** | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| **Devices** | Desktop (1920x1080, 1366x768) |
| **OS** | Windows 10+, macOS 12+, Linux (Ubuntu 22.04) |
| **Network** | Stable Wifi (10+ Mbps) |
| **Backend** | Staging server with session management |
| **Test Users** | 2-3 test accounts |

---

## Test Prioritization

### P0 (Critical) - Security
- SYSTEM_HOME_LOGOUT_01 (prevent unauthorized access)

### P1 (High) - UX
- SYSTEM_HOME_LOGOUT_02 (multi-tab sync)

### P2 (Medium) - Compatibility
- SYSTEM_HOME_BROWSER_01, 02, 03

---

## Notes

- **SYSTEM_HOME_LOGOUT_01**: Critical security test - prevent back navigation to protected pages
- **SYSTEM_HOME_LOGOUT_02**: Improves UX by syncing logout across tabs
- **Safari workaround**: Use polling instead of storage event (more reliable)
- Test in **incognito/private mode** to avoid cache conflicts
- Clear browser data before each test run
- Document timing issues (race conditions in multi-tab tests)
- Test on slow network (throttle to 3G) to verify behavior

---

## Related Documents

- [Unit Test Spec](../unit-test/homepage.unit.spec.ts)
- [Integration Test Spec](../integration-test/homepage.it.spec.ts)
- [Authentication Flow Documentation](../../../docs/auth-flow.md)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Maintained By**: QA Automation Team
