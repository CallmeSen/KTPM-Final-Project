# Admin Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Admin Module, covering authentication flows, user management, product/order management, dashboard analytics, and audit logging.

---

## Test Environment Setup

### Admin Panel Configuration
```javascript
// Cypress configuration
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true
  }
}
```

### Test Users
```javascript
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  regularUser: {
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  },
  lockedAdmin: {
    email: 'locked@example.com',
    password: 'admin123',
    role: 'admin',
    is_active: false
  }
}
```

---

## TEST CASE 1: Admin Login Flow with Role-Based Access

### Test ID: `SYSTEM_ADMIN_AUTH_01`
**Chức năng**: Complete authentication flow with role verification  
**Related Test Cases**: [FE_ADMIN-1], [FE_ADMIN-2], [FE_ADMIN-5]

### Test Steps

#### Step 1: Admin Login Success
```javascript
describe('Admin Authentication Flow', () => {
  it('should allow admin to login and access dashboard', () => {
    // Arrange: Visit admin login page
    cy.visit('/admin/login');

    // Act: Enter admin credentials
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();

    // Assert: Redirect to dashboard
    cy.url().should('include', '/admin/dashboard');
    
    // Assert: Admin menu is visible
    cy.get('[data-testid="admin-menu"]').should('be.visible');
    cy.get('[data-testid="admin-menu"]').should('contain', 'Quản lý User');
    cy.get('[data-testid="admin-menu"]').should('contain', 'Quản lý Sản phẩm');
    
    // Assert: Token stored in localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('admin_token');
      expect(token).to.exist;
    });

    // Screenshot for verification
    cy.screenshot('admin-dashboard-success');
  });
});
```

#### Step 2: Regular User Denied Access
```javascript
it('should deny regular user access to admin panel', () => {
  // Arrange
  cy.visit('/admin/login');

  // Act: Try to login with regular user credentials
  cy.get('[data-testid="email-input"]').type('user@example.com');
  cy.get('[data-testid="password-input"]').type('user123');
  cy.get('[data-testid="login-button"]').click();

  // Assert: Error message displayed
  cy.get('[data-testid="error-message"]')
    .should('be.visible')
    .should('contain', 'Bạn không có quyền truy cập');

  // Assert: Still on login page (not redirected)
  cy.url().should('include', '/admin/login');

  // Assert: No token stored
  cy.window().then((win) => {
    const token = win.localStorage.getItem('admin_token');
    expect(token).to.not.exist;
  });
});
```

#### Step 3: Locked Account Denied
```javascript
it('should deny access for locked admin account', () => {
  // Arrange
  cy.visit('/admin/login');

  // Act: Try to login with locked account
  cy.get('[data-testid="email-input"]').type('locked@example.com');
  cy.get('[data-testid="password-input"]').type('admin123');
  cy.get('[data-testid="login-button"]').click();

  // Assert: Error message
  cy.get('[data-testid="error-message"]')
    .should('contain', 'Tài khoản bị khóa');

  // Assert: Contact support link displayed
  cy.get('[data-testid="support-link"]').should('be.visible');
});
```

---

## TEST CASE 2: Deep Link Redirect After Login

### Test ID: `SYSTEM_ADMIN_AUTH_02`
**Chức năng**: Redirect to intended URL after authentication  
**Related Test Cases**: [FE_ADMIN-5]

### Test Steps

#### Automation Example
```javascript
describe('Deep Link Redirect', () => {
  it('should redirect to intended page after login', () => {
    // Arrange: Try to access /admin/products without being logged in
    cy.visit('/admin/products');

    // Assert: Redirected to login page
    cy.url().should('include', '/admin/login');

    // Act: Login
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();

    // Assert: Redirected back to /admin/products (NOT dashboard)
    cy.url().should('include', '/admin/products');
    cy.url().should('not.include', '/admin/dashboard');

    // Assert: Products page loaded
    cy.get('[data-testid="products-table"]').should('be.visible');
  });

  it('should redirect to dashboard if no intended URL', () => {
    // Arrange: Directly access login page
    cy.visit('/admin/login');

    // Act: Login
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();

    // Assert: Default to dashboard
    cy.url().should('include', '/admin/dashboard');
  });
});
```

---

## TEST CASE 3: User Management Complete Flow

### Test ID: `SYSTEM_ADMIN_USERS_01`
**Chức năng**: Full user management workflow  
**Related Test Cases**: [FE_ADMIN-6] to [FE_ADMIN-14]

### Test Steps

#### Step 1: View and Paginate Users
```javascript
describe('User Management Flow', () => {
  beforeEach(() => {
    // Login as admin
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin/users');
  });

  it('should display paginated user list', () => {
    // Assert: Table visible
    cy.get('[data-testid="users-table"]').should('be.visible');
    
    // Assert: Default 10 users per page
    cy.get('[data-testid="user-row"]').should('have.length', 10);

    // Assert: Pagination info
    cy.get('[data-testid="pagination-info"]')
      .should('contain', 'Trang 1')
      .should('contain', 'Tổng: 50');

    // Act: Go to next page
    cy.get('[data-testid="next-page-btn"]').click();
    cy.wait(500);

    // Assert: Page 2 loaded
    cy.url().should('include', 'page=2');
    cy.get('[data-testid="user-row"]').should('have.length', 10);

    // Assert: Different users (no duplicates)
    cy.get('[data-testid="user-row"]').first()
      .invoke('attr', 'data-user-id')
      .then((page2FirstId) => {
        cy.get('[data-testid="prev-page-btn"]').click();
        cy.wait(500);
        
        cy.get('[data-testid="user-row"]').first()
          .invoke('attr', 'data-user-id')
          .should('not.equal', page2FirstId);
      });
  });
});
```

#### Step 2: Search and Filter Users
```javascript
it('should search users by name and email', () => {
  // Act: Search by name
  cy.get('[data-testid="search-input"]').type('Nguyen Van A');
  cy.get('[data-testid="search-button"]').click();
  cy.wait(500);

  // Assert: Results contain search term
  cy.get('[data-testid="user-row"]').each(($row) => {
    cy.wrap($row).should('contain', 'Nguyen Van A');
  });

  // Act: Clear and search by email
  cy.get('[data-testid="search-input"]').clear().type('test@example.com');
  cy.get('[data-testid="search-button"]').click();
  cy.wait(500);

  // Assert: Exact match
  cy.get('[data-testid="user-row"]').should('have.length', 1);
  cy.get('[data-testid="user-row"]').should('contain', 'test@example.com');
});

it('should filter users by status', () => {
  // Act: Filter by Active
  cy.get('[data-testid="status-filter"]').select('Active');
  cy.wait(500);

  // Assert: All users are active
  cy.get('[data-testid="user-row"]').each(($row) => {
    cy.wrap($row).find('[data-testid="status-badge"]')
      .should('have.class', 'badge-success')
      .should('contain', 'Active');
  });

  // Act: Filter by Banned
  cy.get('[data-testid="status-filter"]').select('Banned');
  cy.wait(500);

  // Assert: All users are banned
  cy.get('[data-testid="user-row"]').each(($row) => {
    cy.wrap($row).find('[data-testid="status-badge"]')
      .should('have.class', 'badge-danger')
      .should('contain', 'Banned');
  });
});
```

#### Step 3: Ban and Unban User
```javascript
it('should ban and unban user account', () => {
  // Arrange: Find active user
  cy.get('[data-testid="user-row"]')
    .filter(':contains("user1@example.com")')
    .as('targetUser');

  // Act: Ban user
  cy.get('@targetUser').find('[data-testid="ban-button"]').click();
  
  // Confirm modal
  cy.get('[data-testid="confirm-modal"]').should('be.visible');
  cy.get('[data-testid="confirm-yes"]').click();
  cy.wait(1000);

  // Assert: Status changed to Banned
  cy.get('@targetUser').find('[data-testid="status-badge"]')
    .should('contain', 'Banned');

  // Assert: Ban button changed to Unban
  cy.get('@targetUser').find('[data-testid="unban-button"]')
    .should('be.visible');

  // Act: Unban user
  cy.get('@targetUser').find('[data-testid="unban-button"]').click();
  cy.get('[data-testid="confirm-yes"]').click();
  cy.wait(1000);

  // Assert: Status back to Active
  cy.get('@targetUser').find('[data-testid="status-badge"]')
    .should('contain', 'Active');
});
```

#### Step 4: Upgrade User Role
```javascript
it('should upgrade user role to admin', () => {
  // Arrange
  cy.get('[data-testid="user-row"]')
    .filter(':contains("user1@example.com")')
    .as('targetUser');

  // Act: Open edit modal
  cy.get('@targetUser').find('[data-testid="edit-button"]').click();
  cy.get('[data-testid="edit-modal"]').should('be.visible');

  // Act: Change role
  cy.get('[data-testid="role-select"]').select('Admin');
  cy.get('[data-testid="save-button"]').click();
  cy.wait(1000);

  // Assert: Role updated
  cy.get('@targetUser').find('[data-testid="role-badge"]')
    .should('contain', 'Admin');

  // Assert: Success message
  cy.get('[data-testid="toast-message"]')
    .should('contain', 'Cập nhật quyền thành công');
});
```

---

## TEST CASE 4: Product Management with Image Upload

### Test ID: `SYSTEM_ADMIN_PRODUCTS_01`
**Chức năng**: Create and manage products with validation  
**Related Test Cases**: [FE_ADMIN-15] to [FE_ADMIN-23]

### Test Steps

#### Step 1: Create Product Successfully
```javascript
describe('Product Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin/products');
  });

  it('should create new product with valid data', () => {
    // Act: Click Add Product
    cy.get('[data-testid="add-product-btn"]').click();
    cy.get('[data-testid="product-modal"]').should('be.visible');

    // Fill form
    cy.get('[data-testid="name-input"]').type('New Product');
    cy.get('[data-testid="price-input"]').type('300000');
    cy.get('[data-testid="description-input"]').type('Product description');
    cy.get('[data-testid="category-select"]').select('1');

    // Upload image
    cy.get('[data-testid="image-input"]').attachFile('product.jpg');

    // Submit
    cy.get('[data-testid="submit-button"]').click();
    cy.wait(1000);

    // Assert: Product appears in list
    cy.get('[data-testid="products-table"]')
      .should('contain', 'New Product');

    // Assert: Success message
    cy.get('[data-testid="toast-message"]')
      .should('contain', 'Tạo sản phẩm thành công');
  });
});
```

#### Step 2: Validation Errors
```javascript
it('should show validation errors for invalid input', () => {
  // Act: Open form
  cy.get('[data-testid="add-product-btn"]').click();

  // Act: Submit without filling (empty name)
  cy.get('[data-testid="submit-button"]').click();

  // Assert: Validation error
  cy.get('[data-testid="name-error"]')
    .should('be.visible')
    .should('contain', 'Tên sản phẩm là bắt buộc');

  // Act: Enter negative price
  cy.get('[data-testid="name-input"]').type('Product');
  cy.get('[data-testid="price-input"]').type('-1000');
  cy.get('[data-testid="submit-button"]').click();

  // Assert: Price error
  cy.get('[data-testid="price-error"]')
    .should('contain', 'Giá phải lớn hơn 0');
});

it('should reject invalid image format', () => {
  // Act: Open form
  cy.get('[data-testid="add-product-btn"]').click();

  // Act: Upload .exe file
  cy.get('[data-testid="image-input"]').attachFile('virus.exe');

  // Assert: File type error
  cy.get('[data-testid="image-error"]')
    .should('be.visible')
    .should('contain', 'Chỉ chấp nhận file ảnh');
});
```

#### Step 3: Delete Product with Order Check
```javascript
it('should prevent deleting product in pending orders', () => {
  // Arrange: Product C is in order 1 (pending)
  cy.get('[data-testid="product-row"]')
    .filter(':contains("Product C")')
    .as('productInOrder');

  // Act: Try to delete
  cy.get('@productInOrder').find('[data-testid="delete-button"]').click();
  cy.get('[data-testid="confirm-yes"]').click();
  cy.wait(1000);

  // Assert: Error message
  cy.get('[data-testid="error-message"]')
    .should('contain', 'Không thể xóa sản phẩm đang được xử lý');

  // Assert: Product still in list
  cy.get('[data-testid="products-table"]')
    .should('contain', 'Product C');
});

it('should soft delete product not in orders', () => {
  // Arrange: Product B not in any order
  cy.get('[data-testid="product-row"]')
    .filter(':contains("Product B")')
    .as('productSafe');

  // Act: Delete
  cy.get('@productSafe').find('[data-testid="delete-button"]').click();
  cy.get('[data-testid="confirm-yes"]').click();
  cy.wait(1000);

  // Assert: Product removed from list
  cy.get('[data-testid="products-table"]')
    .should('not.contain', 'Product B');

  // Assert: Success message
  cy.get('[data-testid="toast-message"]')
    .should('contain', 'Đã xóa sản phẩm');
});
```

---

## TEST CASE 5: Order Status Flow

### Test ID: `SYSTEM_ADMIN_ORDERS_01`
**Chức năng**: Complete order status lifecycle  
**Related Test Cases**: [FE_ADMIN-24] to [FE_ADMIN-27]

### Test Steps

#### Automation Example
```javascript
describe('Order Status Flow', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin/orders');
  });

  it('should update order status through valid lifecycle', () => {
    // Arrange: Find pending order
    cy.get('[data-testid="order-row"]')
      .filter(':contains("Pending")')
      .first()
      .as('targetOrder');

    // Step 1: Pending -> Shipping
    cy.get('@targetOrder').find('[data-testid="status-select"]').select('Shipping');
    cy.get('[data-testid="confirm-yes"]').click();
    cy.wait(1000);

    // Assert: Status updated
    cy.get('@targetOrder').find('[data-testid="status-badge"]')
      .should('contain', 'Shipping');

    // Step 2: Shipping -> Delivered
    cy.get('@targetOrder').find('[data-testid="status-select"]').select('Delivered');
    cy.get('[data-testid="confirm-yes"]').click();
    cy.wait(1000);

    // Assert: Status updated
    cy.get('@targetOrder').find('[data-testid="status-badge"]')
      .should('contain', 'Delivered');

    // Screenshot final state
    cy.screenshot('order-status-delivered');
  });

  it('should prevent invalid status reversal', () => {
    // Arrange: Find delivered order
    cy.get('[data-testid="order-row"]')
      .filter(':contains("Delivered")')
      .first()
      .as('deliveredOrder');

    // Act: Try to change to Pending
    cy.get('@deliveredOrder').find('[data-testid="status-select"]').select('Pending');
    cy.get('[data-testid="confirm-yes"]').click();
    cy.wait(1000);

    // Assert: Error message
    cy.get('[data-testid="error-message"]')
      .should('contain', 'Không thể chuyển ngược trạng thái');

    // Assert: Status unchanged
    cy.get('@deliveredOrder').find('[data-testid="status-badge"]')
      .should('contain', 'Delivered');
  });

  it('should view order details', () => {
    // Act: Click on order ID
    cy.get('[data-testid="order-row"]').first()
      .find('[data-testid="order-id"]')
      .click();

    // Assert: Detail page loaded
    cy.url().should('include', '/admin/orders/');

    // Assert: Order information displayed
    cy.get('[data-testid="customer-name"]').should('be.visible');
    cy.get('[data-testid="total-price"]').should('be.visible');
    cy.get('[data-testid="order-items"]').should('be.visible');

    // Assert: Items table
    cy.get('[data-testid="item-row"]').should('have.length.greaterThan', 0);
  });
});
```

---

## TEST CASE 6: Dashboard Statistics

### Test ID: `SYSTEM_ADMIN_STATS_01`
**Chức năng**: View and filter dashboard analytics  
**Related Test Cases**: [FE_ADMIN-28] to [FE_ADMIN-30]

### Test Steps

```javascript
describe('Dashboard Statistics', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin/dashboard');
  });

  it('should display revenue statistics', () => {
    // Assert: Revenue widget visible
    cy.get('[data-testid="revenue-widget"]').should('be.visible');
    
    // Assert: Revenue number displayed
    cy.get('[data-testid="revenue-amount"]')
      .invoke('text')
      .then((text) => {
        const revenue = parseInt(text.replace(/[^0-9]/g, ''));
        expect(revenue).to.be.greaterThan(0);
      });

    // Assert: Chart displayed
    cy.get('[data-testid="revenue-chart"]').should('be.visible');
  });

  it('should display user count statistics', () => {
    // Assert: User count widget
    cy.get('[data-testid="users-widget"]').should('be.visible');
    cy.get('[data-testid="users-count"]').should('contain', '50');
  });

  it('should filter stats by date range', () => {
    // Act: Select date range
    cy.get('[data-testid="start-date"]').type('2023-12-01');
    cy.get('[data-testid="end-date"]').type('2023-12-15');
    cy.get('[data-testid="apply-filter"]').click();
    cy.wait(1000);

    // Assert: Chart updated
    cy.get('[data-testid="revenue-chart"]').should('be.visible');
    
    // Assert: Date range displayed
    cy.get('[data-testid="date-range-label"]')
      .should('contain', '2023-12-01')
      .should('contain', '2023-12-15');
  });
});
```

---

## TEST CASE 7: Export/Import Workflow

### Test ID: `SYSTEM_ADMIN_IMPORT_01`
**Chức năng**: CSV export and import functionality  
**Related Test Cases**: [FE_ADMIN-31] to [FE_ADMIN-33]

### Test Steps

```javascript
describe('Export/Import Workflow', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
  });

  it('should export users to CSV', () => {
    // Arrange
    cy.visit('/admin/users');

    // Act: Click export button
    cy.get('[data-testid="export-button"]').click();
    cy.wait(2000);

    // Assert: File downloaded
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.readFile(`${downloadsFolder}/users.csv`).should('exist');
    
    // Assert: CSV contains data
    cy.readFile(`${downloadsFolder}/users.csv`).then((content) => {
      expect(content).to.include('id,username,email');
      expect(content).to.include('admin@example.com');
    });
  });

  it('should import products from valid CSV', () => {
    // Arrange
    cy.visit('/admin/products');

    // Act: Upload CSV file
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-input"]').attachFile('products.csv');
    cy.get('[data-testid="upload-button"]').click();
    cy.wait(2000);

    // Assert: Success message
    cy.get('[data-testid="toast-message"]')
      .should('contain', 'Import thành công');

    // Assert: New products in table
    cy.get('[data-testid="products-table"]')
      .should('contain', 'Product X')
      .should('contain', 'Product Y');
  });

  it('should show errors for invalid CSV format', () => {
    // Arrange
    cy.visit('/admin/products');

    // Act: Upload invalid CSV
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-input"]').attachFile('invalid.csv');
    cy.get('[data-testid="upload-button"]').click();
    cy.wait(2000);

    // Assert: Error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .should('contain', 'Lỗi định dạng');

    // Assert: Error details
    cy.get('[data-testid="error-details"]')
      .should('contain', 'dòng 1');
  });
});
```

---

## TEST CASE 8: Audit Log Verification

### Test ID: `SYSTEM_ADMIN_AUDIT_01`
**Chức năng**: Audit logging for sensitive actions  
**Related Test Cases**: [FE_ADMIN-34], [FE_ADMIN-35]

### Test Steps

```javascript
describe('Audit Log System', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
  });

  it('should log admin login action', () => {
    // Act: Navigate to audit logs
    cy.visit('/admin/audit-logs');

    // Assert: Login log exists
    cy.get('[data-testid="log-row"]')
      .filter(':contains("logged in")')
      .should('have.length.greaterThan', 0);

    // Assert: Log details
    cy.get('[data-testid="log-row"]').first().within(() => {
      cy.get('[data-testid="admin-name"]').should('contain', 'admin');
      cy.get('[data-testid="action"]').should('contain', 'logged in');
      cy.get('[data-testid="timestamp"]').should('be.visible');
    });
  });

  it('should log user deletion action', () => {
    // Arrange: Delete a user
    cy.visit('/admin/users');
    cy.get('[data-testid="user-row"]').last()
      .find('[data-testid="delete-button"]').click();
    cy.get('[data-testid="confirm-yes"]').click();
    cy.wait(1000);

    // Act: Check audit logs
    cy.visit('/admin/audit-logs');

    // Assert: Delete log exists
    cy.get('[data-testid="log-row"]')
      .filter(':contains("deleted User")')
      .should('have.length.greaterThan', 0);

    // Assert: Log contains user ID
    cy.get('[data-testid="log-row"]').first().within(() => {
      cy.get('[data-testid="target-type"]').should('contain', 'user');
      cy.get('[data-testid="target-id"]').should('be.visible');
    });
  });
});
```

---

## Cross-Browser Testing

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Admin Login | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ |
| Product CRUD | ✅ | ✅ | ⚠️ Image upload | ✅ |
| Order Status Flow | ✅ | ✅ | ✅ | ✅ |
| CSV Export/Import | ✅ | ✅ | ✅ | ✅ |
| Dashboard Charts | ✅ | ✅ | ⚠️ Chart.js | ✅ |

### Playwright Configuration
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

---

## Performance Requirements

### Page Load Times
- Admin Dashboard: < 2 seconds
- User List (50 items): < 1.5 seconds
- Product List: < 2 seconds
- Order Detail: < 1 second

### API Response Times
- Login API: < 500ms
- Get Users API: < 1000ms
- Update User API: < 500ms
- Export CSV: < 3 seconds

### Lighthouse Metrics
```javascript
test('should meet performance benchmarks', async ({ page }) => {
  const { lhr } = await lighthouse(page.url());
  
  expect(lhr.categories.performance.score).toBeGreaterThan(0.85);
  expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(2000);
  expect(lhr.audits['interactive'].numericValue).toBeLessThan(3000);
});
```

---

## Execution Commands

### Run All System Tests
```bash
# Cypress
npm run cypress:open

# Playwright
npx playwright test admin.system.spec.ts

# Cross-browser
npx playwright test --project=chromium --project=firefox
```

### Generate Reports
```bash
# HTML report
npx playwright show-report

# Allure report
allure generate allure-results --clean
allure open
```

---

## Test Data Requirements

### Database Seed
```sql
-- Admin users
INSERT INTO users (email, password, role, is_active)
VALUES ('admin@example.com', '$2b$10$hash', 'admin', true);

-- Regular users (50 total)
INSERT INTO users (email, password, role, is_active)
SELECT 
  'user' || i || '@example.com',
  '$2b$10$hash',
  'user',
  CASE WHEN i % 10 = 0 THEN false ELSE true END
FROM generate_series(1, 50) AS i;

-- Products
INSERT INTO products (name, price, category_id, is_deleted)
VALUES 
  ('Product A', 100000, 1, false),
  ('Product B', 200000, 2, false),
  ('Product C', 150000, 1, false);

-- Orders
INSERT INTO orders (user_id, total_price, status)
VALUES (2, 250000, 'pending'), (4, 500000, 'delivered');
```

---

## Expected Results Summary

| Test Case | Expected Outcome |
|-----------|------------------|
| **Admin Login** | 200 response, token stored, redirect to dashboard |
| **User Access Denied** | 403 error, no token, error message displayed |
| **Deep Link Redirect** | Return to intended URL after login |
| **User Pagination** | 10 users per page, no duplicates |
| **Ban/Unban User** | Status toggle, button changes |
| **Product CRUD** | Validation errors, soft delete, order check |
| **Order Status Flow** | Valid transitions only, prevent reversal |
| **Export CSV** | File download, correct data |
| **Import CSV** | Parse validation, error reporting |
| **Audit Logs** | Record login, deletions, timestamp |

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Test Framework**: Cypress 13.x / Playwright 1.40.x  
**Recommended Execution**: Nightly regression suite
