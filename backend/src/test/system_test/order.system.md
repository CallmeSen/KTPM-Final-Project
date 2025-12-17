# Order Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Order Module in standardized table format, focusing on Transaction Management, Data Integrity, and Concurrency.

**Module:** Order (Order Transaction Management)  
**Test Type:** System Test / E2E  
**Framework:** Manual Testing / Database Testing Tools  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// Database Transaction Settings
TRANSACTION_ISOLATION: 'READ_COMMITTED'
DATABASE: 'PostgreSQL 15+'
LOCK_TIMEOUT: 5000ms
```

### Test Prerequisites
- Database with Orders, Inventory, Payment tables
- Product Book_01 with initial stock = 10
- Payment Gateway (mock or sandbox)
- Transaction logging enabled

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_ORDER_TXN_01 | Transaction Commit Success | Kiểm thử giao dịch thành công (Happy Path Commit) | 1. **Check Initial State**: Query DB: `SELECT stock FROM inventory WHERE product_id = 'Book_01'` → Expect: 10<br>2. **User Action**: User thêm Book_01 (Qty: 1) vào giỏ hàng<br>3. **Checkout**: Tiến hành đặt hàng và thanh toán với Valid Visa card<br>4. **Wait for Transaction**: Đợi backend xử lý (2-5s)<br>5. **Check Database**: Query 3 bảng:<br>   - `SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC LIMIT 1`<br>   - `SELECT stock FROM inventory WHERE product_id = 'Book_01'`<br>   - `SELECT * FROM payments WHERE order_id = :orderId` | 1. **Orders table**: Có bản ghi mới với `status = 'Paid'`<br>2. **Inventory table**: Stock giảm từ 10 → 9<br>3. **Payments table**: Có log thanh toán với `status = 'SUCCESS'`<br>4. Transaction COMMIT thành công (toàn bộ 3 bảng consistent)<br>5. No errors in application logs | None | Product: Book_01<br>Initial Stock: 10<br>Qty: 1<br>Payment: Valid Visa<br>Expected Stock: 9 | | | Related: [BE_Order-1]<br>Priority: P0 (Critical) |
| SYSTEM_ORDER_TXN_02 | Transaction Rollback on Payment Failure | Kiểm thử Rollback khi lỗi Thanh toán | 1. **Setup**: Verify initial stock = 10<br>2. **User Action**: User tạo đơn hàng Book_01 (Qty: 1)<br>3. **Backend**: Hệ thống lock stock (reservation)<br>4. **Simulate Payment Error**: Giả lập lỗi tại Payment Gateway:<br>   - Thẻ không đủ tiền<br>   - Gateway timeout (5s)<br>   - Connection refused<br>5. **Check API Response**: Expect error response<br>6. **Check Database**: Query Orders, Inventory, Payments tables | 1. **API Response**: `{ "error": "Payment Failed", "code": 402 }`<br>2. **Orders table**: KHÔNG được tạo (hoặc `status = 'Cancelled'` ngay lập tức)<br>3. **Inventory table**: Stock ROLLBACK về 10 (không giảm)<br>4. **Payments table**: Không có record hoặc `status = 'FAILED'`<br>5. Đảm bảo tính nguyên vẹn (Atomicity) | None | Product: Book_01<br>Stock: 10<br>Payment: Invalid Card<br>Expected: Rollback to 10 | | | Related: [BE_Order-2]<br>Test data integrity |
| SYSTEM_ORDER_TXN_03 | Transaction Rollback on Database Error | Kiểm thử Rollback khi lỗi Database giữa chừng | 1. **Setup**: Initial stock = 10<br>2. **Start Transaction**: User bắt đầu tạo đơn hàng<br>3. **Step 1 Success**: INSERT vào `orders` table thành công<br>4. **Simulate DB Error**: Giả lập lỗi khi INSERT vào `order_details`:<br>   - Disconnect database connection<br>   - Foreign Key constraint violation<br>   - Trigger database crash (Docker stop)<br>5. **Check Application Logs**: Verify exception handling<br>6. **Restart DB and Check**: Query `orders` table | 1. **Application**: Báo lỗi "Internal Server Error" (500)<br>2. **Transaction**: Phải ROLLBACK toàn bộ<br>3. **Orders table**: Bản ghi ở Step 3 phải tự động **biến mất** (rollback)<br>4. Không có đơn hàng "rác" (không có chi tiết)<br>5. Inventory không bị giảm<br>6. System recovers gracefully | None | Product: Book_01<br>Simulate: DB Disconnect<br>Expected: Full rollback | | | Related: [BE_Order-3]<br>Exception handling critical |
| SYSTEM_ORDER_CONCURRENCY_01 | Concurrent Order Race Condition | Kiểm thử tranh chấp giao dịch (2 users mua sản phẩm cuối) | 1. **Setup**: Set stock Book_01 = 1 (only 1 item left)<br>2. **Prepare 2 Users**: User1 and User2, both add Book_01 to cart<br>3. **Concurrent Checkout**: Cả 2 users nhấn "Đặt hàng" **chính xác cùng lúc**:<br>   - Use test script to simulate concurrent requests<br>   - Or manually coordinate (countdown timer)<br>4. **Monitor Requests**: Use database transaction logs<br>5. **Check Results**: Query Orders and Inventory tables | 1. **Success Path**: Chỉ **1 transaction thành công** (User1 hoặc User2)<br>   - Winner: Order created, stock = 0<br>2. **Failure Path**: Transaction còn lại **FAIL** và ROLLBACK<br>   - Error: "Out of Stock" / "Insufficient Inventory"<br>3. **Critical**: Stock KHÔNG bị âm (stock ≠ -1)<br>4. No race condition corruption<br>5. Both users receive clear status (success or error) | None | Initial Stock: 1<br>Users: 2 concurrent<br>Expected: 1 success, 1 fail<br>Final Stock: 0 | | | Related: [BE_Order-4]<br>Priority: P0 (Concurrency critical) |

---

## Automation Script Examples

### Database Testing Script (SQL + Node.js)
```javascript
// Test: Transaction Commit Success
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testTransactionCommit() {
  const client = await pool.connect();
  
  try {
    // Check initial stock
    const { rows: [product] } = await client.query(
      'SELECT stock FROM inventory WHERE product_id = $1',
      ['Book_01']
    );
    console.log('Initial stock:', product.stock); // Expect: 10
    
    // Simulate order creation
    await client.query('BEGIN');
    
    // Insert order
    const { rows: [order] } = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id',
      [1, 100000, 'Paid']
    );
    
    // Decrement inventory
    await client.query(
      'UPDATE inventory SET stock = stock - 1 WHERE product_id = $1',
      ['Book_01']
    );
    
    // Insert payment
    await client.query(
      'INSERT INTO payments (order_id, amount, status) VALUES ($1, $2, $3)',
      [order.id, 100000, 'SUCCESS']
    );
    
    await client.query('COMMIT');
    
    // Verify final stock
    const { rows: [updated] } = await client.query(
      'SELECT stock FROM inventory WHERE product_id = $1',
      ['Book_01']
    );
    console.log('Final stock:', updated.stock); // Expect: 9
    
    if (updated.stock === 9) {
      console.log('✅ PASS: Transaction committed successfully');
    } else {
      console.log('❌ FAIL: Stock mismatch');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ FAIL:', err.message);
  } finally {
    client.release();
  }
}
```

### Concurrency Test Script
```javascript
// Test: Concurrent Order Race Condition
async function testConcurrency() {
  // Set stock to 1
  await pool.query('UPDATE inventory SET stock = 1 WHERE product_id = $1', ['Book_01']);
  
  // Simulate 2 concurrent orders
  const order1 = createOrder(1, 'Book_01'); // User 1
  const order2 = createOrder(2, 'Book_01'); // User 2
  
  const results = await Promise.allSettled([order1, order2]);
  
  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');
  
  console.log('Successes:', successes.length); // Expect: 1
  console.log('Failures:', failures.length);   // Expect: 1
  
  // Check final stock
  const { rows: [product] } = await pool.query(
    'SELECT stock FROM inventory WHERE product_id = $1',
    ['Book_01']
  );
  
  if (product.stock === 0 && successes.length === 1) {
    console.log('✅ PASS: Concurrency handled correctly');
  } else if (product.stock < 0) {
    console.log('❌ FAIL: Negative stock! Race condition bug!');
  }
}

async function createOrder(userId, productId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Lock row to prevent concurrent modification
    const { rows: [product] } = await client.query(
      'SELECT stock FROM inventory WHERE product_id = $1 FOR UPDATE',
      [productId]
    );
    
    if (product.stock < 1) {
      throw new Error('Out of Stock');
    }
    
    // Create order
    await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
      [userId, 100000, 'Paid']
    );
    
    // Decrement stock
    await client.query(
      'UPDATE inventory SET stock = stock - 1 WHERE product_id = $1',
      [productId]
    );
    
    await client.query('COMMIT');
    return 'SUCCESS';
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

## Manual Testing Guide

### Test SYSTEM_ORDER_TXN_01: Transaction Commit

**Step-by-Step Manual Execution:**

1. **Prepare Database**
   ```sql
   -- Reset stock to 10
   UPDATE inventory SET stock = 10 WHERE product_id = 'Book_01';
   
   -- Verify
   SELECT * FROM inventory WHERE product_id = 'Book_01';
   ```

2. **Execute Order**
   - Login as test user
   - Add Book_01 to cart (Qty: 1)
   - Proceed to checkout
   - Enter valid test card: `4242 4242 4242 4242` (Stripe test card)
   - Submit payment

3. **Verify Transaction**
   ```sql
   -- Check order created
   SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC LIMIT 1;
   -- Expect: status = 'Paid'
   
   -- Check stock decremented
   SELECT stock FROM inventory WHERE product_id = 'Book_01';
   -- Expect: stock = 9
   
   -- Check payment logged
   SELECT * FROM payments WHERE order_id = :orderId;
   -- Expect: status = 'SUCCESS'
   ```

4. **Pass Criteria**
   - ✅ All 3 tables updated atomically
   - ✅ No errors in logs
   - ✅ Stock = 9

---

### Test SYSTEM_ORDER_TXN_02: Rollback on Payment Failure

**Step-by-Step Manual Execution:**

1. **Setup**
   ```sql
   UPDATE inventory SET stock = 10 WHERE product_id = 'Book_01';
   ```

2. **Simulate Payment Error**
   - Method 1: Use invalid test card: `4000 0000 0000 0002` (Stripe card decline)
   - Method 2: Stop payment gateway service temporarily
   - Method 3: Mock API to return error

3. **Execute Order**
   - Add Book_01 to cart
   - Proceed to checkout
   - Enter invalid card
   - Submit

4. **Verify Rollback**
   ```sql
   -- Order should NOT exist or be cancelled
   SELECT * FROM orders WHERE user_id = :userId AND created_at > NOW() - INTERVAL '1 minute';
   -- Expect: 0 rows OR status = 'Cancelled'
   
   -- Stock should NOT change
   SELECT stock FROM inventory WHERE product_id = 'Book_01';
   -- Expect: stock = 10 (unchanged)
   
   -- Payment should log failure
   SELECT * FROM payments WHERE created_at > NOW() - INTERVAL '1 minute';
   -- Expect: status = 'FAILED' or no record
   ```

5. **Pass Criteria**
   - ✅ Error message displayed to user
   - ✅ Stock unchanged (rollback successful)
   - ✅ No orphaned data

---

### Test SYSTEM_ORDER_CONCURRENCY_01: Race Condition

**Step-by-Step Manual Execution:**

1. **Setup**
   ```sql
   -- Set stock to 1 (last item)
   UPDATE inventory SET stock = 1 WHERE product_id = 'Book_01';
   ```

2. **Coordinate 2 Users**
   - Browser 1 (User1): Login, add Book_01 to cart, go to checkout
   - Browser 2 (User2): Login, add Book_01 to cart, go to checkout
   - Both users wait at payment screen

3. **Concurrent Execution**
   - Use countdown: "3... 2... 1... GO!"
   - Both users click "Place Order" simultaneously
   - Or use automation script to send 2 requests at exact same time

4. **Verify Results**
   ```sql
   -- Check how many orders created
   SELECT COUNT(*) FROM orders 
   WHERE product_id = 'Book_01' AND created_at > NOW() - INTERVAL '1 minute';
   -- Expect: 1 (only one success)
   
   -- Check final stock
   SELECT stock FROM inventory WHERE product_id = 'Book_01';
   -- Expect: 0 (not -1!)
   ```

5. **User Experience**
   - User1 (Winner): See "Order Successful"
   - User2 (Loser): See "Out of Stock. Please try again."

6. **Pass Criteria**
   - ✅ Only 1 order created
   - ✅ Stock = 0 (not negative)
   - ✅ Clear error message for losing user

---

## Test Execution Commands

```bash
# Run database tests
node tests/order.transaction.test.js

# Run concurrency test
node tests/order.concurrency.test.js

# Database monitoring (watch live queries)
psql -d bookstore_test -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check transaction isolation
psql -d bookstore_test -c "SHOW transaction_isolation;"
```

---

## Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Database** | PostgreSQL 15+ with transaction support |
| **Isolation Level** | READ_COMMITTED or SERIALIZABLE |
| **Connection Pool** | Min 10, Max 20 connections |
| **Lock Timeout** | 5000ms |
| **Payment Gateway** | Stripe Test Mode or Mock |

---

## Test Prioritization

### P0 (Critical) - Data Integrity
- SYSTEM_ORDER_TXN_01 (happy path commit)
- SYSTEM_ORDER_CONCURRENCY_01 (race condition prevention)

### P1 (High) - Error Handling
- SYSTEM_ORDER_TXN_02 (payment rollback)
- SYSTEM_ORDER_TXN_03 (database error rollback)

---

## Notes

- **SYSTEM_ORDER_TXN_01**: Baseline test - must pass for production
- **SYSTEM_ORDER_TXN_02**: Critical for financial integrity
- **SYSTEM_ORDER_TXN_03**: Test exception handling and recovery
- **SYSTEM_ORDER_CONCURRENCY_01**: Use database locks (`SELECT ... FOR UPDATE`) to prevent race conditions
- Recommended isolation level: `READ_COMMITTED` (balance between consistency and performance)
- Monitor database deadlocks during concurrency tests
- Use transaction logs for debugging: `SELECT * FROM pg_stat_activity;`

---

## Related Documents

- [Order Unit Tests](../unit_test/order.unit.spec.ts)
- [Order Integration Tests](../integration_test/order.it.spec.ts)
- [PostgreSQL Transaction Documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Manual / Database Testing Scripts  
**Maintained By**: Backend QA Team
