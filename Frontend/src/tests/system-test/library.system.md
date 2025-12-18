# Library Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Library Module in standardized table format.

**Module:** Library (Book Library Page)  
**Test Type:** System Test / E2E  
**Framework:** Cypress 13.x / Playwright 1.40.x  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// Cypress/Playwright config
baseUrl: 'http://localhost:3000'
viewports: 
  - Mobile: 375x667 (iPhone SE)
  - Tablet: 768x1024 (iPad)
  - Desktop: 1920x1080 (Full HD)
```

### Test Prerequisites
- Database với ít nhất 50 books cho lazy load testing
- 3 categories: Tiểu thuyết, Lập trình, Sách mới
- Books có thumbnail images

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_LIB_RESPONSIVE_01 | Mobile Layout 2 Columns | Hiển thị responsive trên mobile (2 cột) | 1. Mở DevTools<br>2. Set viewport: 375x667 (iPhone SE)<br>3. Visit `/library`<br>4. Kiểm tra grid layout<br>5. Verify book items per row | 1. Grid hiển thị **2 cột** (không phải 1 hoặc 3)<br>2. Book items có kích thước đồng đều<br>3. Không có horizontal scroll<br>4. Images load correctly<br>5. Text không bị cut off | None | Viewport: 375x667<br>Grid columns: 2<br>Device: iPhone SE | | | Related: [FE_LIBRARY-15]<br>Mobile responsive |
| SYSTEM_LIB_RESPONSIVE_02 | Desktop Layout 5 Columns | Hiển thị responsive trên desktop (5 cột) | 1. Set viewport: 1920x1080<br>2. Visit `/library`<br>3. Kiểm tra grid layout<br>4. Verify CSS grid-template-columns | 1. Grid hiển thị **5 cột**<br>2. Items không bị stretched<br>3. No horizontal scroll<br>4. All items visible without cutting<br>5. Consistent spacing between items | None | Viewport: 1920x1080<br>Grid columns: 5<br>Device: Desktop | | | Related: [FE_LIBRARY-16]<br>Desktop responsive |
| SYSTEM_LIB_LAZY_LOAD_01 | Lazy Load on Scroll (Mobile) | Lazy loading khi scroll trên mobile | 1. Set viewport: 375x667<br>2. Visit `/library`<br>3. Check initial items loaded (should be 10)<br>4. Scroll to bottom<br>5. Wait for debounce (300ms)<br>6. Check items count increases | 1. Initial load: 10 items<br>2. After scroll: 20 items (loaded +10)<br>3. Smooth scrolling, no jank<br>4. Loading indicator visible during fetch<br>5. Infinite scroll works | None | Initial items: 10<br>Per load: 10<br>Total available: 50+ | | | Lazy load testing<br>Debounce: 300ms |
| SYSTEM_LIB_LAZY_LOAD_02 | Lazy Load on Desktop | Lazy loading khi scroll trên desktop | 1. Set viewport: 1920x1080<br>2. Visit `/library`<br>3. Initial load: 10 items<br>4. Scroll to bottom<br>5. Verify next batch loads | 1. Loads 10 more items (total 20)<br>2. No duplicate items<br>3. Scroll position preserved<br>4. Performance: 60fps scroll | None | Viewport: 1920x1080<br>Items per batch: 10 | | | Desktop lazy load |
| SYSTEM_LIB_NAV_01 | Ctrl+Click Opens New Tab | Ctrl+Click mở book detail trong tab mới | 1. Visit `/library`<br>2. **Ctrl+Click** (Windows) hoặc **Cmd+Click** (Mac) trên book item đầu tiên<br>3. Kiểm tra số lượng tabs<br>4. Verify URLs | 1. Tab mới mở với URL `/book/:id`<br>2. Tab cũ vẫn ở `/library` (không replace)<br>3. Không mất scroll position trên tab cũ<br>4. Book detail page loads correctly | None | Book ID: First item<br>Action: Ctrl+Click (Win)<br>Action: Cmd+Click (Mac) | | | Related: [FE_LIBRARY-24]<br>Browser navigation |
| SYSTEM_LIB_NAV_02 | Back Button Scroll Restoration | Click Back từ Detail phải restore scroll | 1. Visit `/library`<br>2. Scroll xuống (load 20 items)<br>3. Remember scroll Y position (e.g., 800px)<br>4. Click vào book (normal click, same tab)<br>5. On detail page, click browser Back button (←)<br>6. Kiểm tra scroll position | 1. Quay về `/library`<br>2. Scroll position restored (Y ≈ 800px, ±50px tolerance)<br>3. 20 items vẫn còn (không reload về 10)<br>4. No page refresh<br>5. History.scrollRestoration works | None | Scroll Y: 800px<br>Items loaded: 20<br>Tolerance: ±50px | | | Related: [FE_LIBRARY-26]<br>Browser history API |
| SYSTEM_LIB_NAV_03 | Prevent Double Click Navigation | Double click không mở 2 tabs | 1. Visit `/library`<br>2. **Double click** nhanh trên book item (< 300ms)<br>3. Monitor browser tabs opened<br>4. Check debounce logic | 1. Chỉ mở **1 tab** (hoặc navigate 1 lần)<br>2. Không mở 2+ tabs/pages<br>3. Debounce navigation (300ms)<br>4. Second click bị ignore | None | Click interval: < 300ms<br>Debounce: 300ms<br>Expected: 1 navigation | | | Related: [FE_LIBRARY-27]<br>Debounce navigation |
| SYSTEM_LIB_CROSS_BROWSER_01 | Chrome Browser Test | Kiểm tra Library trên Chrome | 1. Mở Chrome (latest)<br>2. Test lazy load scroll<br>3. Test responsive grid (mobile/desktop)<br>4. Test Ctrl+Click, Back button | 1. Lazy load works ✅<br>2. Grid responsive ✅<br>3. Navigation ✅<br>4. No console errors<br>5. Performance good | None | Browser: Chrome (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_LIB_CROSS_BROWSER_02 | Firefox Browser Test | Kiểm tra Library trên Firefox | 1. Mở Firefox (latest)<br>2. Test all features<br>3. Check scroll behavior<br>4. Test Ctrl+Click | 1. All features work ✅<br>2. Scroll smooth<br>3. Navigation correct<br>4. No Firefox-specific bugs | None | Browser: Firefox (latest)<br>OS: Windows/Mac | | | Cross-browser test |
| SYSTEM_LIB_CROSS_BROWSER_03 | Safari Browser Test | Kiểm tra Library trên Safari | 1. Mở Safari (14+)<br>2. Test features<br>3. **Note**: Cmd+Click (not Ctrl+Click)<br>4. Test scroll restoration | 1. Features work ✅<br>2. **Cmd+Click** mở tab mới<br>3. Scroll restore may differ (browser API)<br>4. Document Safari differences | None | Browser: Safari 14+<br>OS: macOS<br>**Cmd+Click** on Mac | | | ⚠️ Safari: Cmd+Click, scroll API differences |
| SYSTEM_LIB_PERF_01 | Lighthouse Performance Score | Đo performance với Lighthouse | 1. Use Lighthouse (Chrome DevTools)<br>2. Run audit on `/library`<br>3. Check scores: Performance, FCP, LCP | 1. Performance score > 90<br>2. First Contentful Paint (FCP) < 2s<br>3. Largest Contentful Paint (LCP) < 2.5s<br>4. No accessibility errors<br>5. No console errors | None | Tool: Lighthouse<br>Target: Performance > 90<br>FCP < 2s, LCP < 2.5s | | | Performance benchmark |

---

## Automation Script Examples

### Cypress Example
```javascript
describe('Library System Tests', () => {
  it('[SYSTEM_LIB_RESPONSIVE_01] Mobile 2 columns layout', () => {
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/library');
    
    cy.get('[data-testid="book-grid"]').should('be.visible');
    
    // Check grid has 2 columns
    cy.get('[data-testid="book-grid"]').then(($grid) => {
      const columns = window.getComputedStyle($grid[0]).gridTemplateColumns;
      expect(columns).to.contain('repeat(2'); // 2 columns
    });
    
    // No horizontal scroll
    cy.window().then((win) => {
      expect(win.document.body.scrollWidth).to.equal(375);
    });
  });

  it('[SYSTEM_LIB_LAZY_LOAD_01] Lazy load on scroll', () => {
    cy.viewport(375, 667);
    cy.visit('/library');
    
    // Initial: 10 items
    cy.get('[data-testid="book-item"]').should('have.length', 10);
    
    // Scroll to bottom
    cy.scrollTo('bottom', { duration: 500 });
    cy.wait(500); // Debounce + fetch
    
    // Now: 20 items
    cy.get('[data-testid="book-item"]').should('have.length', 20);
  });

  it('[SYSTEM_LIB_NAV_02] Back button scroll restoration', () => {
    cy.visit('/library');
    
    // Scroll down
    cy.scrollTo(0, 800);
    cy.wait(500);
    
    // Remember scroll position
    cy.window().then((win) => {
      const scrollY = win.scrollY;
      expect(scrollY).to.be.closeTo(800, 50);
    });
    
    // Click book (normal click)
    cy.get('[data-testid="book-item"]').first().click();
    cy.url().should('include', '/book/');
    
    // Go back
    cy.go('back');
    cy.url().should('include', '/library');
    
    // Check scroll restored
    cy.window().then((win) => {
      expect(win.scrollY).to.be.closeTo(800, 50);
    });
  });
});
```

### Playwright Example
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_LIB_NAV_01] Ctrl+Click opens new tab', async ({ page, context }) => {
  await page.goto('/library');
  
  const firstBook = page.locator('[data-testid="book-item"]').first();
  
  // Ctrl+Click (Windows) or Cmd+Click (Mac)
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    firstBook.click({ modifiers: ['Control'] }) // Use 'Meta' for Mac
  ]);
  
  // Assert new tab opened
  expect(newPage).toBeDefined();
  await expect(newPage).toHaveURL(/.*\/book\/.+/);
  
  // Original page unchanged
  await expect(page).toHaveURL(/.*\/library/);
});

test('[SYSTEM_LIB_NAV_03] Prevent double click', async ({ page }) => {
  await page.goto('/library');
  
  const navigationPromises = [];
  
  // Listen for navigation
  page.on('framenavigated', () => {
    navigationPromises.push(true);
  });
  
  const firstBook = page.locator('[data-testid="book-item"]').first();
  
  // Double click rapidly
  await firstBook.dblclick();
  
  await page.waitForTimeout(500);
  
  // Only 1 navigation should occur
  expect(navigationPromises.length).toBeLessThanOrEqual(1);
});

test('[SYSTEM_LIB_PERF_01] Lighthouse performance', async ({ page }) => {
  const { lhr } = await lighthouse(page.url());
  
  expect(lhr.categories.performance.score).toBeGreaterThan(0.9);
  expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(2000);
  expect(lhr.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500);
});
```

---

## Test Execution Commands

```bash
# Run all library system tests
npx cypress run --spec "cypress/e2e/library.system.cy.js"

# Run responsive tests only
npx playwright test --grep "SYSTEM_LIB_RESPONSIVE"

# Run navigation tests
npx playwright test --grep "SYSTEM_LIB_NAV"

# Cross-browser testing
npx playwright test library.system.spec.ts --project=chromium --project=firefox --project=webkit

# Performance testing
npx playwright test --grep "SYSTEM_LIB_PERF"
```

---

## Cross-Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Lazy Load Scroll | ✅ | ✅ | ✅ | ✅ |
| Responsive Grid | ✅ | ✅ | ✅ | ✅ |
| Ctrl+Click New Tab | ✅ | ✅ | ⚠️ Cmd+Click | ✅ |
| Back Scroll Restore | ✅ | ✅ | ⚠️ May differ | ✅ |
| Debounce Navigation | ✅ | ✅ | ✅ | ✅ |

**Notes:**
- Safari: Use **Cmd+Click** instead of Ctrl+Click on macOS
- Safari: Scroll restoration may behave differently due to browser history API

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 3s | Lighthouse |
| First Contentful Paint (FCP) | < 2s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Scroll performance | 60fps | DevTools Performance |
| Lazy load batch | 10 items in < 500ms | Network tab |
| Debounce delay | 300ms | Code implementation |

---

## Test Prioritization

### P0 (Critical)
- SYSTEM_LIB_RESPONSIVE_01, 02 (core UX)
- SYSTEM_LIB_LAZY_LOAD_01 (performance critical)

### P1 (High)
- SYSTEM_LIB_NAV_01, 02 (user navigation)
- SYSTEM_LIB_CROSS_BROWSER_01, 02, 03

### P2 (Medium)
- SYSTEM_LIB_NAV_03 (edge case)
- SYSTEM_LIB_PERF_01 (optimization)

---

## Notes

- **SYSTEM_LIB_RESPONSIVE_01/02**: Test on real devices when possible (not just DevTools)
- **SYSTEM_LIB_NAV_02**: Scroll restoration uses `history.scrollRestoration = 'auto'` (check browser support)
- **SYSTEM_LIB_NAV_03**: Debounce prevents accidental double navigation
- **Safari differences**: Cmd+Click on Mac, scroll API may differ
- Use `window.history.scrollRestoration = 'manual'` for custom scroll restoration
- For Lighthouse tests, use incognito mode to avoid extensions interference

---

## Related Documents

- [Unit Test Spec](../unit-test/library.unit.spec.ts)
- [Integration Test Spec](../integration-test/library.it.spec.ts)
- [Responsive Design Spec](../../../design/responsive-spec.md)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Maintained By**: QA Automation Team
