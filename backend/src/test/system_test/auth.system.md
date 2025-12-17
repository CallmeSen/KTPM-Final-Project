# Auth Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Auth Module in standardized table format.

**Module:** Auth (Google OAuth Authentication)  
**Test Type:** System Test / E2E  
**Framework:** Manual Testing / Cypress / Playwright  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// OAuth Configuration
GOOGLE_CLIENT_ID: 'test_client_id'
GOOGLE_CLIENT_SECRET: 'test_secret'
GOOGLE_REDIRECT_URI: 'http://localhost:4000/auth/google/callback'
```

### Test Prerequisites
- Google OAuth Test Account: valid_user@gmail.com
- Backend server running on port 4000
- Database with Users table
- Frontend redirect URLs configured

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_AUTH_OAUTH_01 | Google OAuth Login Success | Đăng nhập Google thành công với luồng Redirect & Callback | 1. Open Login Page<br>2. Click nút "Login with Google"<br>3. Verify redirect to `accounts.google.com`<br>4. Enter valid Google credentials<br>5. Click "Allow/Chấp nhận"<br>6. Verify Google redirects back to application (Redirect URI) | 1. Backend processes authorization code<br>2. Backend returns JWT Token<br>3. User is logged in successfully<br>4. User redirected to Dashboard/Home page<br>5. Token stored in localStorage/cookie | None | Email: valid_user@gmail.com<br>Status: Active<br>OAuth Provider: Google<br>Scopes: email, profile | | | Related: [BE_Auth-19]<br>Full OAuth flow |
| SYSTEM_AUTH_OAUTH_02 | User Denies OAuth Permission | Người dùng từ chối cấp quyền trên Google consent screen | 1. Open Login Page<br>2. Click "Login with Google"<br>3. On Google consent screen, click "Cancel" or "Deny"<br>4. Observe redirect behavior | 1. Google redirects back to application Login page<br>2. No Token is generated<br>3. Error message displayed: "Đăng nhập bị hủy hoặc thất bại"<br>4. User can retry login<br>5. No database changes | None | Action: User clicks "Deny"<br>Expected: No authentication | | | Related: [BE_Auth-20]<br>User cancellation handling |
| SYSTEM_AUTH_OAUTH_03 | Auto Registration via Google | Đăng ký tự động khi email Google chưa tồn tại trong DB | 1. **Precondition**: Gmail `new_user@gmail.com` MUST NOT exist in DB<br>2. Perform "Login with Google" flow successfully<br>3. Complete Google authentication<br>4. Access Database (Admin tool)<br>5. Query the `Users` table for `new_user@gmail.com` | 1. Login successful (no manual registration required)<br>2. New record created in `Users` table<br>3. Email = `new_user@gmail.com`<br>4. `provider` or `source` field = 'Google'<br>5. User auto-logged in with JWT token<br>6. Redirect to onboarding or home page | None | Email: new_user@gmail.com<br>Provider: Google<br>Auto-create: True<br>**Must not exist before test** | | | Related: [BE_Auth-21]<br>Auto user creation logic |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Auth OAuth System Tests', () => {
  it('[SYSTEM_AUTH_OAUTH_01] Google OAuth login success', () => {
    cy.visit('/login');
    
    // Stub OAuth flow (Cypress limitation with popups)
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        // Simulate successful OAuth callback
        cy.visit('/auth/google/callback?code=mock_code&state=valid_state');
      });
    });
    
    cy.get('[data-testid="google-login-btn"]').click();
    
    // Assert redirected to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', 'valid_user@gmail.com');
  });

  it('[SYSTEM_AUTH_OAUTH_02] User denies OAuth', () => {
    cy.visit('/login');
    
    // Simulate denial by redirecting to login with error
    cy.visit('/auth/google/callback?error=access_denied');
    
    // Should show error message
    cy.contains('Đăng nhập bị hủy hoặc thất bại').should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_AUTH_OAUTH_03] Auto registration via Google', async ({ page }) => {
  // Clear user from DB first (ensure not exists)
  await page.request.delete('/api/test/users/new_user@gmail.com');
  
  await page.goto('/login');
  
  // Click Google login button
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('[data-testid="google-login-btn"]')
  ]);
  
  // Wait for Google login page
  await popup.waitForLoadState();
  
  // Fill Google credentials (in real test, use Playwright's auth)
  await popup.fill('[name="email"]', 'new_user@gmail.com');
  await popup.fill('[name="password"]', 'test_password');
  await popup.click('[type="submit"]');
  
  // Click "Allow" on consent screen
  await popup.click('button:has-text("Allow")');
  
  // Wait for redirect back to app
  await page.waitForURL('**/dashboard');
  
  // Verify user created in DB
  const response = await page.request.get('/api/users/me');
  const user = await response.json();
  
  expect(user.email).toBe('new_user@gmail.com');
  expect(user.provider).toBe('Google');
});
```

---

## Manual Testing Guide

### Test SYSTEM_AUTH_OAUTH_01: Google Login Success

**Step-by-Step Manual Execution:**

1. **Setup**
   - Open browser (Chrome/Firefox)
   - Navigate to `http://localhost:3000/login`
   - Clear cookies and localStorage

2. **Execute**
   - Click "Login with Google" button
   - **Expected**: Browser redirects to `https://accounts.google.com/o/oauth2/v2/auth?...`
   - Enter Google credentials: `valid_user@gmail.com` / password
   - Click "Allow" on consent screen
   - **Expected**: Redirect back to `http://localhost:3000/auth/google/callback?code=...`

3. **Verify**
   - **Expected**: Final redirect to `http://localhost:3000/dashboard`
   - Check localStorage: `token` key should exist
   - Check UI: User email displayed in header
   - Check database: Query `SELECT * FROM users WHERE email = 'valid_user@gmail.com'`
   - **Expected**: Record exists with `provider = 'Google'`

4. **Pass Criteria**
   - ✅ All redirects successful
   - ✅ Token generated and stored
   - ✅ User logged in to dashboard
   - ✅ Database updated correctly

---

### Test SYSTEM_AUTH_OAUTH_02: User Denies Permission

**Step-by-Step Manual Execution:**

1. **Setup**
   - Navigate to login page
   - Clear session data

2. **Execute**
   - Click "Login with Google"
   - On Google consent screen, click **"Cancel"** or **"Deny"**
   - **Expected**: Redirect to `http://localhost:3000/login?error=access_denied`

3. **Verify**
   - **Expected**: Error message displayed: "Đăng nhập bị hủy hoặc thất bại"
   - Check localStorage: No `token` key
   - Check database: No new user created
   - User can retry (Google login button still functional)

4. **Pass Criteria**
   - ✅ Graceful error handling
   - ✅ No broken state
   - ✅ User can retry login

---

### Test SYSTEM_AUTH_OAUTH_03: Auto Registration

**Step-by-Step Manual Execution:**

1. **Setup**
   - **CRITICAL**: Use a Gmail account that has NEVER logged in before
   - Recommended: Create new test account `test_new_user_123@gmail.com`
   - Verify in database: `SELECT * FROM users WHERE email = 'test_new_user_123@gmail.com'` → Should return 0 rows

2. **Execute**
   - Perform Google login with new account
   - Complete OAuth flow (Allow permissions)

3. **Verify**
   - **Expected**: Login successful (no error about "user not found")
   - Navigate to `http://localhost:3000/dashboard`
   - Check database:
     ```sql
     SELECT * FROM users WHERE email = 'test_new_user_123@gmail.com';
     ```
   - **Expected**: 1 row returned with:
     - `email = 'test_new_user_123@gmail.com'`
     - `provider = 'Google'`
     - `created_at = [timestamp of login]`

4. **Pass Criteria**
   - ✅ Auto user creation successful
   - ✅ No manual registration required
   - ✅ User logged in immediately after first OAuth

---

## Test Execution Commands

```bash
# Run backend server
npm run start:dev

# Run frontend (if separate)
cd frontend && npm run dev

# Run E2E tests (Playwright)
npx playwright test auth.system.spec.ts

# Run specific test
npx playwright test --grep "SYSTEM_AUTH_OAUTH_01"

# Debug mode
npx playwright test --debug
```

---

## Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Backend** | NestJS server on port 4000 |
| **Frontend** | React/Next.js on port 3000 |
| **Database** | PostgreSQL/MySQL with Users table |
| **Google OAuth** | Test credentials configured |
| **Browsers** | Chrome 120+, Firefox 120+, Edge 120+ |

---

## Test Data Requirements

### Google Test Accounts

```javascript
const testAccounts = {
  existing: {
    email: 'valid_user@gmail.com',
    password: 'TestPassword123',
    status: 'Exists in DB'
  },
  newUser: {
    email: 'new_user@gmail.com',
    password: 'TestPassword123',
    status: 'Must NOT exist in DB before test'
  }
};
```

### Database Seed (Before Testing)

```sql
-- Ensure existing user
INSERT INTO users (email, provider, created_at)
VALUES ('valid_user@gmail.com', 'Google', NOW())
ON CONFLICT (email) DO NOTHING;

-- Ensure new user NOT exists
DELETE FROM users WHERE email = 'new_user@gmail.com';
```

---

## Test Prioritization

### P0 (Critical) - Core Authentication
- SYSTEM_AUTH_OAUTH_01 (happy path login)

### P1 (High) - Error Handling
- SYSTEM_AUTH_OAUTH_02 (user denial)
- SYSTEM_AUTH_OAUTH_03 (auto registration)

---

## Notes

- **SYSTEM_AUTH_OAUTH_01**: Requires real Google OAuth credentials (or mock in CI/CD)
- **SYSTEM_AUTH_OAUTH_02**: Test graceful error handling, no crash
- **SYSTEM_AUTH_OAUTH_03**: Critical to clean DB before test (no existing user)
- Use Google OAuth test mode in development environment
- For CI/CD: Use mocked OAuth responses to avoid rate limits
- Document any CORS issues during OAuth redirect
- Test with different browser privacy settings (cookies, localStorage)

---

## Related Documents

- [Auth Unit Tests](../unit_test/auth.unit.spec.ts)
- [Auth Integration Tests](../integration_test/auth.it.spec.ts)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Manual / Cypress / Playwright  
**Maintained By**: Backend QA Team
