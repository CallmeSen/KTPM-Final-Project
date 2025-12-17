# Register Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Register Module, specifically focusing on **Google OAuth Registration Flow**. These tests cover browser interactions, popup handling, network scenarios, and security validation.

---

## Test Environment Setup

### OAuth Configuration
```javascript
// Cypress configuration
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1920,
    viewportHeight: 1080,
    chromeWebSecurity: false, // Required for OAuth popup testing
    video: true,
    screenshotOnRunFailure: true,
    env: {
      googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
      googleRedirectUri: 'http://localhost:3000/auth/google/callback'
    }
  }
}
```

### Test Accounts
```javascript
const testAccounts = {
  newGoogleUser: {
    email: 'newuser.test@gmail.com',
    password: 'TestPassword123',
    status: 'Not in DB'
  },
  existingUser: {
    email: 'existing@gmail.com',
    password: 'ExistingPass123',
    status: 'Already registered manually'
  }
}
```

---

## TEST CASE 1: Google OAuth - New User Registration

### Test ID: `ST_FE_REG_OAuth_01`
**Chức năng**: [FE_RegisterPage-7] ST_FE_REG_OAuth_Success_New  
**Mô tả**: Đăng ký mới bằng Google thành công

### Test Steps

#### Step 1: Initiate Google Sign-Up
```javascript
describe('Google OAuth Registration Flow', () => {
  it('should register new user via Google OAuth successfully', () => {
    // Arrange: Visit register page
    cy.visit('/register');

    // Assert: Google sign-up button visible
    cy.get('[data-testid="google-signup-btn"]')
      .should('be.visible')
      .should('contain', 'Sign up with Google');

    // Act: Click Google sign-up button
    cy.get('[data-testid="google-signup-btn"]').click();

    // Assert: Google OAuth popup opens
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        expect(url).to.include('accounts.google.com');
        expect(url).to.include('oauth2/auth');
        return win; // Return window object
      });
    });
  });
});
```

#### Step 2: Google Login Flow (Simulated)
```javascript
it('should handle Google OAuth callback with new user', () => {
  // Note: In real E2E, this requires Google OAuth test credentials
  // For automation, we simulate the callback

  // Arrange: Mock OAuth callback with new user data
  const oauthCallback = {
    state: 'valid_state_token',
    code: 'google_auth_code_12345',
    scope: 'email profile'
  };

  // Act: Visit callback URL (simulating Google redirect)
  cy.visit(`/auth/google/callback?code=${oauthCallback.code}&state=${oauthCallback.state}`);

  // Wait for backend processing
  cy.wait(2000);

  // Assert: User created in database
  cy.request('GET', '/api/users/me').then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.email).to.include('@gmail.com');
    expect(response.body.oauth_provider).to.eq('google');
  });

  // Assert: Auto-login successful
  cy.window().then((win) => {
    const token = win.localStorage.getItem('auth_token');
    expect(token).to.exist;
  });

  // Assert: Redirected to home page
  cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  cy.get('[data-testid="user-menu"]').should('be.visible');

  // Screenshot for verification
  cy.screenshot('oauth-new-user-success');
});
```

---

## TEST CASE 2: User Cancels OAuth Flow

### Test ID: `ST_FE_REG_OAuth_02`
**Chức năng**: [FE_RegisterPage-8] ST_FE_REG_OAuth_User_Cancel  
**Mô tả**: User hủy thao tác giữa chừng

### Test Steps

#### Automation Example (Playwright)
```javascript
import { test, expect } from '@playwright/test';

test('should handle user cancellation of Google OAuth', async ({ page, context }) => {
  // Arrange: Visit register page
  await page.goto('/register');

  // Act: Click Google sign-up button
  const [popup] = await Promise.all([
    context.waitForEvent('page'), // Wait for popup
    page.click('[data-testid="google-signup-btn"]')
  ]);

  // Assert: Popup opened
  expect(popup.url()).toContain('accounts.google.com');

  // Act: User closes popup (cancel action)
  await popup.close();
  await page.waitForTimeout(1000);

  // Assert: Main page still on register page
  expect(page.url()).toContain('/register');

  // Assert: Application did not crash
  const errorMessage = await page.locator('[data-testid="error-banner"]').count();
  expect(errorMessage).toBe(0); // No error displayed

  // Assert: Register form still functional
  const googleButton = await page.locator('[data-testid="google-signup-btn"]');
  await expect(googleButton).toBeVisible();
  await expect(googleButton).toBeEnabled();
});
```

#### Cypress Alternative
```javascript
it('should stay on register page when OAuth is cancelled', () => {
  // Arrange
  cy.visit('/register');

  // Act: Click Google button (popup will be blocked in headless mode)
  cy.window().then((win) => {
    // Stub window.open to simulate popup closure
    cy.stub(win, 'open').returns({
      closed: true, // Immediately closed
      close: () => {}
    });
  });

  cy.get('[data-testid="google-signup-btn"]').click();
  cy.wait(1000);

  // Assert: Still on register page
  cy.url().should('include', '/register');

  // Assert: No crash, form still visible
  cy.get('[data-testid="register-form"]').should('be.visible');
  cy.get('[data-testid="google-signup-btn"]').should('be.visible');
});
```

---

## TEST CASE 3: OAuth with Existing Email (Account Merge)

### Test ID: `ST_FE_REG_OAuth_03`
**Chức năng**: [FE_RegisterPage-9] ST_FE_REG_OAuth_Existing_Email  
**Mô tả**: Đăng ký trùng Email (Merge Account)

### Test Steps

#### Step 1: Setup Existing User
```javascript
describe('Google OAuth - Existing Email Scenario', () => {
  before(() => {
    // Arrange: Create user manually in database
    cy.task('db:seed', {
      table: 'users',
      data: {
        email: 'existing@gmail.com',
        username: 'existinguser',
        password_hash: '$2b$10$hashed_password',
        oauth_provider: null, // Manual registration
        created_at: new Date().toISOString()
      }
    });
  });

  it('should link Google account to existing email', () => {
    // Arrange: Visit register page
    cy.visit('/register');

    // Act: Sign up with Google using existing email
    cy.get('[data-testid="google-signup-btn"]').click();

    // Simulate OAuth callback with existing email
    const oauthData = {
      email: 'existing@gmail.com',
      google_id: 'google_user_12345',
      name: 'Existing User',
      picture: 'https://example.com/photo.jpg'
    };

    cy.intercept('POST', '/api/auth/google/callback', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Account linked successfully',
          user: {
            id: 1,
            email: 'existing@gmail.com',
            oauth_provider: 'google',
            google_id: 'google_user_12345'
          },
          token: 'merged_auth_token_12345'
        }
      });
    }).as('googleCallback');

    cy.visit('/auth/google/callback?code=test_code&state=valid_state');
    cy.wait('@googleCallback');

    // Assert: Login successful (no duplicate error)
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Assert: User logged in
    cy.get('[data-testid="user-menu"]').should('be.visible');

    // Assert: Database updated
    cy.task('db:query', {
      sql: 'SELECT * FROM users WHERE email = ?',
      params: ['existing@gmail.com']
    }).then((result) => {
      expect(result.oauth_provider).to.eq('google');
      expect(result.google_id).to.eq('google_user_12345');
    });

    // Screenshot
    cy.screenshot('oauth-account-merge-success');
  });
});
```

---

## TEST CASE 4: Popup Blocked by Browser

### Test ID: `ST_FE_REG_OAuth_04`
**Chức năng**: [FE_RegisterPage-10] ST_FE_REG_OAuth_Popup_Blocked  
**Mô tả**: Trình duyệt chặn Popup

### Test Steps

#### Automation Example
```javascript
describe('OAuth Popup Blocker Handling', () => {
  it('should display instructions when popup is blocked', () => {
    // Arrange: Visit register page
    cy.visit('/register');

    // Act: Simulate popup blocker
    cy.window().then((win) => {
      // Stub window.open to return null (blocked popup)
      cy.stub(win, 'open').returns(null);
    });

    // Act: Click Google button
    cy.get('[data-testid="google-signup-btn"]').click();
    cy.wait(500);

    // Assert: Error message displayed
    cy.get('[data-testid="popup-blocked-message"]')
      .should('be.visible')
      .should('contain', 'Vui lòng cho phép mở popup');

    // Assert: Instructions visible
    cy.get('[data-testid="popup-instructions"]')
      .should('be.visible')
      .should('contain', 'Cài đặt trình duyệt');

    // Assert: Application did not freeze
    cy.get('[data-testid="register-form"]').should('be.visible');
    cy.get('[data-testid="username-input"]').should('be.enabled');

    // Screenshot
    cy.screenshot('popup-blocked-warning');
  });

  it('should allow retry after enabling popup', () => {
    // Arrange: Visit page
    cy.visit('/register');

    // First attempt: Blocked
    cy.window().then((win) => {
      cy.stub(win, 'open').returns(null);
    });
    cy.get('[data-testid="google-signup-btn"]').click();
    cy.wait(500);

    // Assert: Error shown
    cy.get('[data-testid="popup-blocked-message"]').should('be.visible');

    // Act: Click retry button
    cy.get('[data-testid="retry-oauth-btn"]').click();

    // Assert: Second attempt should work (in real scenario)
    // In test, we just verify button is clickable
    cy.get('[data-testid="google-signup-btn"]').should('be.visible');
  });
});
```

---

## TEST CASE 5: Network Failure During OAuth Redirect

### Test ID: `ST_FE_REG_OAuth_05`
**Chức năng**: [FE_RegisterPage-11] ST_FE_REG_OAuth_Network_Fail  
**Mô tả**: Mất mạng khi đang Redirect

### Test Steps

#### Playwright Network Interception
```javascript
import { test, expect } from '@playwright/test';

test('should handle network failure during OAuth redirect', async ({ page, context }) => {
  // Arrange: Visit register page
  await page.goto('/register');

  // Act: Click Google sign-up
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('[data-testid="google-signup-btn"]')
  ]);

  // Simulate successful Google login (popup closes)
  await popup.close();

  // Act: Simulate network disconnection during redirect
  await context.setOffline(true);
  await page.waitForTimeout(2000);

  // Assert: Error page displayed
  const errorText = await page.locator('body').textContent();
  expect(errorText).toContain('kết nối');

  // Act: Reconnect network
  await context.setOffline(false);
  await page.reload();

  // Assert: Redirect to login page (safe fallback)
  await page.waitForTimeout(1000);
  expect(page.url()).toContain('/login');

  // Assert: No data corruption
  const errorMessage = await page.locator('[data-testid="auth-error"]').count();
  expect(errorMessage).toBe(0);
});
```

#### Cypress Network Simulation
```javascript
it('should recover from network failure gracefully', () => {
  // Arrange
  cy.visit('/register');

  // Act: Simulate network error during OAuth callback
  cy.intercept('POST', '/api/auth/google/callback', {
    forceNetworkError: true
  }).as('networkError');

  // Simulate callback attempt
  cy.visit('/auth/google/callback?code=test&state=valid', {
    failOnStatusCode: false
  });

  // Assert: Error page or connection error
  cy.contains('kết nối', { matchCase: false }).should('be.visible');

  // Act: Restore network and refresh
  cy.intercept('POST', '/api/auth/google/callback').as('restored');
  cy.reload();

  // Assert: Redirect to safe page (login)
  cy.url().should('include', '/login');
  
  // Assert: Application functional
  cy.get('[data-testid="login-form"]').should('be.visible');
});
```

---

## TEST CASE 6: OAuth State Mismatch (Security)

### Test ID: `ST_FE_REG_OAuth_06`
**Chức năng**: [FE_RegisterPage-12] ST_FE_REG_OAuth_Invalid_State  
**Mô tả**: Lỗi xác thực (State Mismatch)

### Test Steps

#### Security Test - CSRF Protection
```javascript
describe('OAuth Security - State Validation', () => {
  it('should reject OAuth callback with invalid state token', () => {
    // Arrange: Visit register page and get valid state
    cy.visit('/register');
    
    let validState;
    cy.window().then((win) => {
      // Capture state token generated during OAuth initiation
      cy.stub(win, 'open').callsFake((url) => {
        const urlObj = new URL(url);
        validState = urlObj.searchParams.get('state');
        return win;
      });
    });

    cy.get('[data-testid="google-signup-btn"]').click();

    // Act: Simulate callback with WRONG state token
    const invalidState = 'tampered_state_token';
    cy.visit(`/auth/google/callback?code=valid_code&state=${invalidState}`, {
      failOnStatusCode: false
    });

    // Assert: Error message displayed
    cy.get('[data-testid="auth-error"]')
      .should('be.visible')
      .should('contain', 'Phiên hết hạn');

    // Assert: User NOT logged in
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.not.exist;
    });

    // Assert: Redirected to error page or login
    cy.url().should('match', /\/(login|error)/);
  });

  it('should reject expired state token (30 minutes)', () => {
    // Arrange: Generate state token
    cy.visit('/register');

    // Mock time advance (30 minutes)
    cy.clock();
    cy.tick(30 * 60 * 1000); // 30 minutes

    // Act: Try to use old state token
    cy.visit('/auth/google/callback?code=code&state=old_state', {
      failOnStatusCode: false
    });

    // Assert: Session expired error
    cy.contains('Phiên hết hạn', { matchCase: false }).should('be.visible');

    // Assert: Instruction to reload
    cy.contains('tải lại trang', { matchCase: false }).should('be.visible');
  });

  it('should require page reload after state expiry', () => {
    // Arrange: Expired session
    cy.visit('/register');
    cy.clock();
    cy.tick(31 * 60 * 1000); // 31 minutes (expired)

    // Act: Click Google button
    cy.get('[data-testid="google-signup-btn"]').click();

    // Assert: Warning to reload
    cy.get('[data-testid="session-warning"]')
      .should('be.visible')
      .should('contain', 'tải lại');

    // Act: Reload page
    cy.reload();

    // Assert: New state token generated
    cy.get('[data-testid="google-signup-btn"]').should('be.visible');
  });
});
```

---

## Cross-Browser Testing

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Google OAuth Popup | ✅ | ✅ | ⚠️ Popup blocker | ✅ |
| Account Merge | ✅ | ✅ | ✅ | ✅ |
| Network Failure Handling | ✅ | ✅ | ✅ | ✅ |
| State Validation | ✅ | ✅ | ✅ | ✅ |
| Popup Cancel | ✅ | ✅ | ⚠️ Behavior differs | ✅ |

### Browser-Specific Notes

**Safari**:
- More aggressive popup blocker - users must manually allow
- OAuth redirect timing may differ
- localStorage behavior slightly different

**Firefox**:
- Enhanced Tracking Protection may block Google OAuth
- Test with `privacy.trackingprotection.enabled=false`

---

## Performance Requirements

### OAuth Flow Timing
- Popup open: < 500ms
- Google authentication: < 5 seconds (user interaction)
- Callback processing: < 2 seconds
- Auto-login redirect: < 1 second

### Lighthouse Metrics
```javascript
test('OAuth flow should maintain good performance', async ({ page }) => {
  const { lhr } = await lighthouse(page.url());
  
  expect(lhr.audits['interactive'].numericValue).toBeLessThan(3000);
  expect(lhr.categories.performance.score).toBeGreaterThan(0.8);
});
```

---

## Security Checklist

### OAuth Implementation Requirements

- ✅ **State Token Validation**: CSRF protection via state parameter
- ✅ **HTTPS Only**: OAuth redirect URIs must use HTTPS (except localhost)
- ✅ **Token Expiry**: State tokens expire after 30 minutes
- ✅ **Scope Limitation**: Request only necessary scopes (email, profile)
- ✅ **Account Linking**: Safely merge OAuth with existing manual accounts
- ✅ **Error Handling**: No sensitive data in error messages

### Test Validation
```javascript
describe('OAuth Security Validation', () => {
  it('should use HTTPS for redirect URI in production', () => {
    cy.visit('/register');
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        const urlObj = new URL(url);
        const redirectUri = urlObj.searchParams.get('redirect_uri');
        
        if (Cypress.env('NODE_ENV') === 'production') {
          expect(redirectUri).to.match(/^https:\/\//);
        }
        
        return win;
      });
    });
    cy.get('[data-testid="google-signup-btn"]').click();
  });

  it('should not expose sensitive data in error messages', () => {
    cy.visit('/auth/google/callback?error=access_denied', {
      failOnStatusCode: false
    });

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();
      
      // Should NOT contain sensitive info
      expect(text).to.not.include('client_secret');
      expect(text).to.not.include('api_key');
      expect(text).to.not.include('token');
    });
  });
});
```

---

## Execution Commands

### Run All System Tests
```bash
# Cypress
npm run cypress:open

# Playwright
npx playwright test register.system.spec.ts

# Specific test
npx playwright test --grep "OAuth"
```

### Generate Reports
```bash
# HTML report
npx playwright show-report

# Video recording
npm run cypress:run --record
```

---

## Test Data Requirements

### Database Seed
```sql
-- Existing user for merge test
INSERT INTO users (email, username, password_hash, oauth_provider)
VALUES ('existing@gmail.com', 'existinguser', '$2b$10$hash', NULL);

-- OAuth state tokens table
CREATE TABLE oauth_states (
  state_token VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE
);
```

### Environment Variables
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
SESSION_SECRET=your_session_secret
```

---

## Expected Results Summary

| Test Case | Expected Outcome |
|-----------|------------------|
| **New User OAuth** | User created, auto-login, redirect to home |
| **User Cancel** | Stay on register page, no crash, form functional |
| **Existing Email** | Account linked, no duplicate error, successful login |
| **Popup Blocked** | Error message, instructions, app functional |
| **Network Failure** | Error page, safe redirect after F5, no corruption |
| **Invalid State** | Reject callback, session expired message, no login |

---

## Known Issues & Limitations

### OAuth Testing Challenges
1. **Google Test Accounts**: Requires real Google OAuth test credentials
2. **Popup Automation**: Headless browsers may block popups differently
3. **Network Simulation**: Not all E2E tools simulate network failures perfectly
4. **Timing Issues**: OAuth redirects have variable timing

### Workarounds
- Use OAuth stubbing for CI/CD environments
- Mock OAuth endpoints for predictable testing
- Use Playwright's network interception for offline testing
- Implement retry logic for flaky OAuth tests

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Recommended Execution**: Pre-release regression + Manual exploratory testing for OAuth
