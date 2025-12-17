# Library Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Library module, covering responsive design, browser navigation, and cross-device synchronization.

---

## Test Environment Setup

### Browser Configuration
```javascript
// Cypress configuration
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true
  }
}
```

### Devices to Test
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1920x1080 (Full HD)

### Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## TEST CASE 1: Responsive Design - Lazy Load Behavior

### Test ID: `FE_LIBRARY-15`
**Chức năng**: FE_LIB_Responsive_Mobile  
**Mô tả**: Hiển thị responsive trên mobile

### Test Steps

#### Step 1: Setup Mobile Viewport
```javascript
describe('Library - Responsive Lazy Load', () => {
  it('should display 2 columns on mobile (375px)', () => {
    // Arrange: Set mobile viewport
    cy.viewport(375, 667);
    cy.visit('/library');

    // Act: Wait for page load
    cy.get('[data-testid="book-grid"]').should('be.visible');

    // Assert: Check grid columns
    cy.get('[data-testid="book-grid"]').then(($grid) => {
      const columns = window.getComputedStyle($grid[0]).gridTemplateColumns;
      
      // Mobile: 2 cột
      expect(columns).to.contain('repeat(2');
    });
  });
});
```

#### Step 2: Verify Lazy Load on Mobile
```javascript
it('should lazy load on scroll (mobile)', () => {
  cy.viewport(375, 667);
  cy.visit('/library');

  // Initial load: 10 items
  cy.get('[data-testid="book-item"]').should('have.length', 10);

  // Scroll to bottom
  cy.scrollTo('bottom', { duration: 500 });
  cy.wait(300); // Debounce delay

  // Load more: 20 items
  cy.get('[data-testid="book-item"]').should('have.length', 20);

  // Screenshot for visual verification
  cy.screenshot('mobile-lazy-load');
});
```

---

## TEST CASE 2: Responsive Design - Desktop Layout

### Test ID: `FE_LIBRARY-16`
**Chức năng**: FE_LIB_Responsive_Desktop  
**Mô tả**: Hiển thị responsive trên desktop

### Test Steps

#### Step 1: Verify Desktop Grid
```javascript
it('should display 5 columns on desktop (1920px)', () => {
  // Arrange: Set desktop viewport
  cy.viewport(1920, 1080);
  cy.visit('/library');

  // Act: Wait for page load
  cy.get('[data-testid="book-grid"]').should('be.visible');

  // Assert: Check grid columns
  cy.get('[data-testid="book-grid"]').then(($grid) => {
    const columns = window.getComputedStyle($grid[0]).gridTemplateColumns;
    
    // Desktop: 5 cột
    expect(columns).to.contain('repeat(5');
  });
});
```

#### Step 2: Verify All Items Visible
```javascript
it('should fit all items without horizontal scroll', () => {
  cy.viewport(1920, 1080);
  cy.visit('/library');

  // Assert: No horizontal scroll
  cy.window().then((win) => {
    expect(win.document.body.scrollWidth).to.equal(win.innerWidth);
  });

  // Assert: Items are not cut off
  cy.get('[data-testid="book-item"]').first().then(($item) => {
    const rect = $item[0].getBoundingClientRect();
    expect(rect.right).to.be.lessThan(1920);
  });
});
```

---

## TEST CASE 3: Navigation - Ctrl+Click New Tab

### Test ID: `FE_LIBRARY-24`
**Chức năng**: FE_LIB_Nav_CtrlClick_NewTab  
**Mô tả**: Ctrl+Click mở tab mới, không replace tab hiện tại

### Test Steps

#### Automation Example (Playwright)
```javascript
import { test, expect } from '@playwright/test';

test('should open book detail in new tab with Ctrl+Click', async ({ page, context }) => {
  // Arrange: Navigate to library
  await page.goto('/library');
  await page.waitForSelector('[data-testid="book-item"]');

  // Act: Ctrl+Click on first book
  const firstBook = page.locator('[data-testid="book-item"]').first();
  const bookTitle = await firstBook.locator('h3').textContent();

  // Open new tab with Ctrl+Click (Cmd+Click on Mac)
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    firstBook.click({ modifiers: ['Control'] }) // ['Meta'] on Mac
  ]);

  // Assert: New tab opened
  const pages = context.pages();
  expect(pages.length).toBe(2);

  // Assert: New tab shows book detail
  await newPage.waitForLoadState();
  const detailTitle = await newPage.locator('h1').textContent();
  expect(detailTitle).toContain(bookTitle);

  // Assert: Original tab still on library page
  const originalUrl = page.url();
  expect(originalUrl).toContain('/library');
});
```

---

## TEST CASE 4: Navigation - Back Button Scroll Restoration

### Test ID: `FE_LIBRARY-26`
**Chức năng**: FE_LIB_Nav_Back_ScrollRestore  
**Mô tả**: Click Back từ trang Detail phải quay về vị trí scroll cũ trên Library

### Test Steps

#### Step 1: Scroll and Remember Position
```javascript
describe('Library - Scroll Restoration', () => {
  it('should restore scroll position after back navigation', () => {
    // Arrange: Visit library and scroll
    cy.visit('/library');
    cy.wait(500);

    // Scroll to position 500px
    cy.scrollTo(0, 500);
    
    // Store scroll position
    cy.window().then((win) => {
      cy.wrap(win.scrollY).as('scrollPosition');
    });

    // Act: Click on a book
    cy.get('[data-testid="book-item"]').eq(5).click();
    cy.url().should('include', '/book/');
    cy.wait(1000);

    // Click browser Back button
    cy.go('back');
    cy.url().should('include', '/library');

    // Assert: Scroll position restored
    cy.get('@scrollPosition').then((originalScroll) => {
      cy.window().its('scrollY').should('be.closeTo', originalScroll, 50);
    });
  });
});
```

#### Step 2: Verify Items Still Loaded
```javascript
it('should keep loaded items after back navigation', () => {
  cy.visit('/library');

  // Load 2 pages (20 items)
  cy.scrollTo('bottom');
  cy.wait(300);
  cy.get('[data-testid="book-item"]').should('have.length', 20);

  // Navigate to detail and back
  cy.get('[data-testid="book-item"]').last().click();
  cy.wait(1000);
  cy.go('back');

  // Assert: Still showing 20 items (not reset to 10)
  cy.get('[data-testid="book-item"]').should('have.length', 20);
});
```

---

## TEST CASE 5: Navigation - Prevent Double Click

### Test ID: `FE_LIBRARY-27`
**Chức năng**: FE_LIB_Nav_DoubleClick_Prevent  
**Mô tả**: Double click không mở 2 tab

### Test Steps

#### Automation Example
```javascript
test('should prevent double click opening multiple tabs', async ({ page, context }) => {
  // Arrange
  await page.goto('/library');
  await page.waitForSelector('[data-testid="book-item"]');

  const firstBook = page.locator('[data-testid="book-item"]').first();

  // Act: Double click rapidly
  await firstBook.click();
  await firstBook.click({ delay: 50 }); // Click again after 50ms

  // Assert: Only one navigation occurred
  await page.waitForTimeout(1000);
  
  const pages = context.pages();
  expect(pages.length).toBe(1); // Still only 1 tab

  // Assert: URL changed only once
  const url = page.url();
  expect(url).toContain('/book/');
});
```

#### Debounce Implementation Check
```javascript
it('should debounce navigation with 300ms delay', () => {
  cy.visit('/library');
  
  // Spy on router navigation
  cy.window().then((win) => {
    cy.spy(win.history, 'pushState').as('navigate');
  });

  // Click multiple times rapidly
  cy.get('[data-testid="book-item"]').first().click();
  cy.wait(100);
  cy.get('[data-testid="book-item"]').first().click();
  cy.wait(100);
  cy.get('[data-testid="book-item"]').first().click();

  // Assert: Only 1 navigation call
  cy.wait(500);
  cy.get('@navigate').should('have.been.calledOnce');
});
```

---

## TEST CASE 6: Cross-Browser Compatibility

### Test ID: Cross-Browser Test Suite
**Mô tả**: Kiểm tra trên nhiều trình duyệt

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Lazy Load Scroll | ✅ | ✅ | ✅ | ✅ |
| Responsive Grid | ✅ | ✅ | ✅ | ✅ |
| Ctrl+Click New Tab | ✅ | ✅ | ⚠️ Cmd+Click | ✅ |
| Back Scroll Restore | ✅ | ✅ | ⚠️ May differ | ✅ |
| URL Encoding | ✅ | ✅ | ✅ | ✅ |

### Playwright Cross-Browser Config
```javascript
// playwright.config.ts
export default {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'edge', use: { ...devices['Desktop Edge'] } }
  ]
};
```

### Run Cross-Browser Tests
```bash
# Run all browsers
npx playwright test --project=chromium --project=firefox --project=webkit --project=edge

# Generate HTML report
npx playwright show-report
```

---

## TEST CASE 7: Multi-Device Sync (Advanced)

### Test ID: `FE_LIBRARY_MultiDevice_Sync`
**Mô tả**: Đồng bộ scroll position giữa các thiết bị (nếu có session sync)

### Test Steps

#### Scenario: Mobile + Desktop Sync
```javascript
test.describe('Multi-device scroll sync', () => {
  test('should sync scroll position across devices', async ({ browser }) => {
    // Create 2 browser contexts (simulate 2 devices)
    const mobileContext = await browser.newContext({
      ...devices['iPhone 12'],
      storageState: 'auth.json' // Same user session
    });
    const desktopContext = await browser.newContext({
      ...devices['Desktop Chrome'],
      storageState: 'auth.json'
    });

    const mobilePage = await mobileContext.newPage();
    const desktopPage = await desktopContext.newPage();

    // Both open library
    await mobilePage.goto('/library');
    await desktopPage.goto('/library');

    // Scroll on mobile
    await mobilePage.evaluate(() => window.scrollTo(0, 800));
    await mobilePage.waitForTimeout(500);

    // Assert: Desktop syncs scroll (if implemented)
    // This requires WebSocket/Server-Sent Events
    const desktopScroll = await desktopPage.evaluate(() => window.scrollY);
    expect(desktopScroll).toBeCloseTo(800, 100);

    await mobileContext.close();
    await desktopContext.close();
  });
});
```

---

## TEST CASE 8: Performance Testing

### Test ID: `FE_LIBRARY_Performance`
**Mô tả**: Kiểm tra hiệu năng lazy load

### Lighthouse Metrics
```javascript
test('should meet performance metrics', async ({ page }) => {
  // Run Lighthouse audit
  const { lhr } = await lighthouse(page.url(), {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    onlyCategories: ['performance']
  });

  // Assert: Performance score > 90
  expect(lhr.categories.performance.score).toBeGreaterThan(0.9);

  // Assert: Lazy load images
  expect(lhr.audits['offscreen-images'].score).toBe(1);

  // Assert: First Contentful Paint < 2s
  expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(2000);
});
```

---

## Execution Commands

### Run All System Tests
```bash
# Cypress
npm run cypress:open

# Playwright
npx playwright test

# Specific test file
npx playwright test library.system.spec.ts
```

### Generate Reports
```bash
# Cypress video + screenshots
npm run cypress:run --record

# Playwright HTML report
npx playwright show-report

# Allure report (if configured)
allure serve allure-results
```

---

## Test Data Requirements

### Minimum Data for Testing
- **Categories**: At least 3 categories (1 empty, 2 with books)
- **Books**: At least 50 books for lazy load testing
- **Users**: 2 user accounts for multi-tab sync testing

### Database Seed Script
```sql
-- Seed categories
INSERT INTO categories (name) VALUES ('Tiểu thuyết'), ('Lập trình'), ('Sách mới');

-- Seed 50 books
INSERT INTO books (title, category_id, price, thumbnail)
SELECT 
  'Book ' || generate_series,
  (generate_series % 2) + 1, -- Alternate categories
  RANDOM() * 500000,
  'book_' || generate_series || '.jpg'
FROM generate_series(1, 50);
```

---

## Expected Results Summary

| Test Case | Expected Outcome |
|-----------|------------------|
| **Responsive Mobile** | 2 columns grid, lazy load works |
| **Responsive Desktop** | 5 columns grid, no horizontal scroll |
| **Ctrl+Click** | Opens new tab, original tab unchanged |
| **Back Button** | Scroll position restored ±50px |
| **Double Click** | Only 1 navigation, debounced 300ms |
| **Cross-Browser** | All features work on Chrome/Firefox/Safari/Edge |
| **Performance** | Lighthouse score > 90, FCP < 2s |

---

## Notes

### Known Issues
- **Safari**: Scroll restoration may behave differently due to browser history API differences
- **Mobile Safari**: Ctrl+Click requires Cmd+Click gesture
- **Firefox**: May have different scroll event throttling

### Browser-Specific Workarounds
```javascript
// Detect browser
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Adjust scroll restoration
if (isSafari) {
  window.history.scrollRestoration = 'manual';
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Test Framework**: Cypress 13.x / Playwright 1.40.x
