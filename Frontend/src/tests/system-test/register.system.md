# Register Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Register Module in standardized table format.

**Module:** Register (Registration with Google OAuth)  
**Test Type:** System Test / E2E  
**Framework:** Cypress 13.x / Playwright 1.40.x  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// OAuth Configuration
GOOGLE_CLIENT_ID: 'test_client_id'
GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback'
SESSION_SECRET: 'test_secret'
```

### Test Accounts
- **New Google User**: newuser.test@gmail.com (not in DB)
- **Existing User**: existing@gmail.com (already registered manually)
- OAuth state tokens expire after 30 minutes

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_REG_OAUTH_01 | Google OAuth New User Success | Đăng ký mới bằng Google OAuth thành công | 1. Visit `/register`<br>2. Click "Sign up with Google" button<br>3. Popup window opens (Google login page)<br>4. Enter Google credentials in popup<br>5. Authorize app permissions<br>6. Popup closes, redirect to callback<br>7. Check final URL and user state | 1. User account created in database<br>2. Auto-login sau khi đăng ký<br>3. Redirect to homepage `/`<br>4. User info hiển thị ở header<br>5. Token stored in localStorage<br>6. Email from Google saved correctly | None | Email: newuser.test@gmail.com<br>Google ID: 1234567890<br>Status: New user | | | Related: [FE_RegisterPage-7]<br>Requires Google OAuth test credentials |
| SYSTEM_REG_OAUTH_02 | User Cancels OAuth Flow | User hủy thao tác giữa chừng | 1. Visit `/register`<br>2. Click "Sign up with Google"<br>3. Popup opens<br>4. **User closes popup** (click X or Cancel button in Google login)<br>5. Check app state | 1. Stay on register page `/register`<br>2. No user created<br>3. No crash or error<br>4. Form functional, có thể thử lại<br>5. Message (optional): "Đăng ký đã bị hủy" | None | Action: User closes popup<br>Result: Cancelled | | | Related: [FE_RegisterPage-8]<br>Test user cancellation |
| SYSTEM_REG_OAUTH_03 | OAuth Existing Email Merge | Đăng ký trùng Email (Account Linking) | 1. **Setup**: Tạo user manual với email `existing@gmail.com`<br>2. Visit `/register`<br>3. Click "Sign up with Google"<br>4. Login Google với `existing@gmail.com`<br>5. Authorize app | 1. No error "Email already exists"<br>2. Accounts được link (merge)<br>3. User có thể login bằng cả password và Google<br>4. Success message: "Tài khoản đã được liên kết"<br>5. No duplicate user record | None | Email: existing@gmail.com<br>Existing: Manual account<br>OAuth: Link Google account | | | Related: [FE_RegisterPage-9]<br>Business logic: Safe merge |
| SYSTEM_REG_OAUTH_04 | Popup Blocked by Browser | Trình duyệt chặn Popup | 1. **Setup**: Enable popup blocker in browser settings<br>2. Visit `/register`<br>3. Click "Sign up with Google"<br>4. Browser blocks popup (null window returned) | 1. Detect popup blocked (window.open returns null)<br>2. Display error message: "Popup bị chặn. Vui lòng cho phép popup"<br>3. Instructions: "Settings → Allow popup for this site"<br>4. App không crash<br>5. Có thể retry sau khi enable popup | None | Browser: Popup blocker ON<br>window.open(): Returns null | | | Related: [FE_RegisterPage-10]<br>Graceful error handling |
| SYSTEM_REG_OAUTH_05 | Network Failure During Redirect | Mất mạng khi đang Redirect | 1. Click "Sign up with Google"<br>2. Complete Google login in popup<br>3. **During redirect**: Ngắt mạng (DevTools Offline mode)<br>4. Callback URL fails to load<br>5. Reconnect network<br>6. Press F5 to refresh | 1. Display error page: "Kết nối bị gián đoạn"<br>2. After refresh: Safe fallback to `/auth/login`<br>3. No corrupt session data<br>4. No half-created user account<br>5. User có thể retry registration | None | Network: Offline during callback<br>Action: F5 after reconnect | | | Related: [FE_RegisterPage-11]<br>Test network interruption |
| SYSTEM_REG_OAUTH_06 | OAuth State Mismatch (CSRF) | Lỗi xác thực State Token | 1. Intercept OAuth callback request<br>2. Modify `state` parameter to invalid value (e.g., "hacker_state")<br>3. Send modified request to callback URL<br>4. Backend validates state token | 1. Backend rejects request (state mismatch)<br>2. Error: "Xác thực thất bại. Vui lòng thử lại"<br>3. No user created<br>4. Redirect to `/register`<br>5. Security log recorded | None | State: Invalid token<br>Expected: Valid token<br>Security: CSRF protection | | | Related: [FE_RegisterPage-12]<br>Security test: State validation |
| SYSTEM_REG_OAUTH_07 | OAuth State Token Expiry | State token hết hạn (30 phút) | 1. Click "Sign up with Google"<br>2. Popup opens, nhưng **không login ngay**<br>3. Đợi > 30 phút (hoặc modify token timestamp)<br>4. Complete Google login after 30 min<br>5. Callback with expired state token | 1. Backend detects expired state (timestamp > 30 min)<br>2. Error: "Phiên đăng ký đã hết hạn"<br>3. No user created<br>4. Redirect to `/register` để thử lại<br>5. User must restart OAuth flow | None | State token: Created at T<br>Callback at: T + 31 min<br>Expiry: 30 min | | | Related: [FE_RegisterPage-12]<br>Security: Token expiry |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Register OAuth System Tests', () => {
  it('[SYSTEM_REG_OAUTH_01] Google OAuth new user success', () => {
    cy.visit('/register');
    
    // Stub OAuth flow (Cypress can't handle real popups easily)
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        // Simulate successful OAuth callback
        cy.visit('/auth/google/callback?code=mock_code&state=valid_state');
      });
    });
    
    cy.get('[data-testid="google-signup-btn"]').click();
    
    // Assert redirected to home
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid="user-menu"]').should('contain', 'newuser.test@gmail.com');
  });

  it('[SYSTEM_REG_OAUTH_02] User cancels OAuth', () => {
    cy.visit('/register');
    
    cy.window().then((win) => {
      cy.stub(win, 'open').returns(null); // Simulate cancelled popup
    });
    
    cy.get('[data-testid="google-signup-btn"]').click();
    
    // Should stay on register page
    cy.url().should('include', '/register');
    cy.contains('Đăng ký đã bị hủy').should('be.visible');
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_REG_OAUTH_04] Popup blocked by browser', async ({ page, context }) => {
  await page.goto('/register');
  
  // Block popups by not granting permission
  await context.grantPermissions([]);
  
  // Click Google signup button
  const [popup] = await Promise.all([
    context.waitForEvent('page', { timeout: 1000 }).catch(() => null),
    page.click('[data-testid="google-signup-btn"]')
  ]);
  
  // Assert popup was blocked (null)
  expect(popup).toBeNull();
  
  // Assert error message shown
  await expect(page.locator('.error-message')).toContainText('Popup bị chặn');
  await expect(page.locator('.instructions')).toContainText('Vui lòng cho phép popup');
});

test('[SYSTEM_REG_OAUTH_05] Network failure during redirect', async ({ page, context }) => {
  await page.goto('/register');
  
  // Click Google signup
  await page.click('[data-testid="google-signup-btn"]');
  
  // Simulate network failure during callback
  await context.setOffline(true);
  
  // Try to navigate to callback (should fail)
  await page.goto('/auth/google/callback?code=test&state=valid').catch(() => {});
  
  // Assert error page
  await expect(page.locator('h1')).toContainText('Kết nối bị gián đoạn');
  
  // Reconnect
  await context.setOffline(false);
  await page.reload();
  
  // Should fallback to login
  await expect(page).toHaveURL(/.*\/auth\/login/);
});

test('[SYSTEM_REG_OAUTH_06] OAuth state mismatch (CSRF)', async ({ page, request }) => {
  // Directly call callback with invalid state
  const response = await request.get('/auth/google/callback', {
    params: {
      code: 'valid_code',
      state: 'hacker_state_invalid'
    }
  });
  
  // Backend should reject
  expect(response.status()).toBe(403); // Forbidden
  
  // Visit the URL
  await page.goto('/auth/google/callback?code=valid_code&state=hacker_state_invalid');
  
  // Assert error message
  await expect(page.locator('.error-message')).toContainText('Xác thực thất bại');
  
  // Redirected back to register
  await expect(page).toHaveURL(/.*\/register/);
});
```

---

## Test Execution Commands

```bash
# Run all register OAuth tests
npx cypress run --spec "cypress/e2e/register.system.cy.js"

# Run specific test
npx playwright test --grep "SYSTEM_REG_OAUTH"

# Security tests only
npx playwright test --grep "SYSTEM_REG_OAUTH_06|SYSTEM_REG_OAUTH_07"

# Cross-browser testing
npx playwright test register.system.spec.ts --project=chromium --project=firefox --project=webkit
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Google OAuth Popup | ✅ | ✅ | ⚠️ Popup blocker | ✅ |
| Account Merge | ✅ | ✅ | ✅ | ✅ |
| Network Failure Handling | ✅ | ✅ | ✅ | ✅ |
| State Validation (CSRF) | ✅ | ✅ | ✅ | ✅ |
| Popup Cancel | ✅ | ✅ | ⚠️ Behavior differs | ✅ |

**Safari Notes:**
- More aggressive popup blocker - users must manually allow
- OAuth redirect timing may differ
- localStorage behavior slightly different in private mode

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Popup open | < 500ms | User perception |
| Google authentication | < 5s | User interaction time |
| Callback processing | < 2s | Backend + DB insert |
| Auto-login redirect | < 1s | Page navigation |
| Total OAuth flow | < 10s | End-to-end |

---

## Security Checklist

### OAuth Implementation Requirements
- ✅ **State Token Validation**: CSRF protection via state parameter
- ✅ **HTTPS Only**: OAuth redirect URIs must use HTTPS (except localhost)
- ✅ **Token Expiry**: State tokens expire after 30 minutes
- ✅ **Scope Limitation**: Request only necessary scopes (email, profile)
- ✅ **Account Linking**: Safely merge OAuth with existing manual accounts
- ✅ **Error Handling**: No sensitive data in error messages

---

## Test Prioritization

### P0 (Critical) - Security & Core Flow
- SYSTEM_REG_OAUTH_01 (core registration flow)
- SYSTEM_REG_OAUTH_06 (CSRF protection)

### P1 (High) - UX & Error Handling
- SYSTEM_REG_OAUTH_02 (user cancellation)
- SYSTEM_REG_OAUTH_04 (popup blocked)
- SYSTEM_REG_OAUTH_05 (network failure)

### P2 (Medium) - Advanced Features
- SYSTEM_REG_OAUTH_03 (account merge)
- SYSTEM_REG_OAUTH_07 (token expiry)

---

## Notes

- **SYSTEM_REG_OAUTH_01**: Requires real Google OAuth test credentials (or mocking)
- **SYSTEM_REG_OAUTH_03**: Test account linking carefully to avoid duplicate users
- **SYSTEM_REG_OAUTH_06**: Critical security test - must reject invalid state tokens
- For CI/CD environments, use OAuth stubbing/mocking to avoid real Google API calls
- Popup automation: Headless browsers may block popups differently
- Use Playwright's context.waitForEvent('page') to handle popup windows
- Document popup blocker behavior for each browser

---

## Related Documents

- [Unit Test Spec](../unit-test/register.unit.spec.ts)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Backend OAuth Implementation](../../../Backend/src/modules/auth/strategies/google.strategy.ts)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Maintained By**: QA Automation Team
