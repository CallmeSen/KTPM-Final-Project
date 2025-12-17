# System Test Scenarios - Order Module

## Overview
This document outlines the System Test scenarios for the Order Module, focusing on Transaction Management, Data Integrity, and Concurrency. These tests require a fully integrated environment with a running Database and Payment Gateway (or realistic mocks).

## Test Scenarios

### [BE_Order-1] ST_ORDER_CreateOrder_Commit
**Title:** Kiểm thử giao dịch thành công (Commit)  
**Objective:** Đảm bảo toàn bộ luồng tạo đơn hàng được lưu DB thành công.  
**Technique:** Transaction Testing (Happy Path)  
**Pre-condition:** Sản phẩm Book_01 có tồn kho = 10.  
**Test Data:** 
- Product: Book_01
- Qty: 1
- Pay: Valid Visa

**Steps:**
1. Kiểm tra tồn kho SP A = 10.
2. User thêm SP A (SL: 1) vào giỏ.
3. Tiến hành đặt hàng và thanh toán thành công.
4. Check lại DB (Bảng Order, Inventory, Payment).

**Expected Result:**
1. Bảng Order: Có bản ghi mới, status = "Paid".
2. Bảng Inventory: Tồn kho giảm còn 9.
3. Bảng Payment: Có log thanh toán.
-> Giao dịch Commit thành công.

---

### [BE_Order-2] ST_ORDER_CreateOrder_Rollback_PaymentFail
**Title:** Kiểm thử Rollback khi lỗi Thanh toán  
**Objective:** Đảm bảo data không bị lưu nửa vời nếu tiền chưa trừ.  
**Technique:** Transaction Testing (Rollback)  
**Test Data:**
- Product: Book_01
- Qty: 1
- Pay: Invalid Card

**Steps:**
1. User gọi lệnh tạo đơn hàng.
2. Hệ thống giữ chỗ tồn kho (Lock stock).
3. Giả lập lỗi tại cổng thanh toán (Thẻ không đủ tiền/Gateway timeout).
4. Kiểm tra lại DB.

**Expected Result:**
1. API trả về lỗi Payment Failed.
2. Bảng Order: KHÔNG được tạo (hoặc status = Cancelled ngay lập tức).
3. Bảng Inventory: Tồn kho hoàn tác (Rollback) về 10.
-> Đảm bảo tính nguyên vẹn (Atomicity).

---

### [BE_Order-3] ST_ORDER_CreateOrder_Rollback_DbError
**Title:** Kiểm thử Rollback khi lỗi Database  
**Objective:** Kiểm thử tính toàn vẹn khi sập hệ thống giữa chừng.  
**Technique:** Transaction Testing (Exception Handling)  
**Test Data:**
- Product: Book_01
- Simulate: DB Disconnect

**Steps:**
1. Bắt đầu transaction tạo đơn.
2. Insert vào bảng Order thành công.
3. Giả lập mất kết nối DB hoặc lỗi Foreign Key khi đang Insert vào bảng OrderDetail (Chi tiết đơn).
4. Check lại bảng Order.

**Expected Result:**
1. Hệ thống báo lỗi "Internal Server Error".
2. Transaction phải Rollback toàn bộ.
3. Bản ghi ở bảng Order (bước 2) phải tự động biến mất.
-> Không có đơn hàng "rác" (không có chi tiết).

---

### [BE_Order-4] ST_ORDER_CreateOrder_Concurrency
**Title:** Kiểm thử tranh chấp giao dịch (Concurrency)  
**Objective:** 2 người cùng mua 1 sản phẩm cuối cùng.  
**Technique:** Transaction Locking  
**Pre-condition:** Tồn kho = 1  
**Test Data:** Users: 2 concurrent requests

**Steps:**
1. Tồn kho SP A = 1.
2. User 1 và User 2 cùng nhấn "Đặt hàng" chính xác cùng 1 thời điểm.
3. Quan sát kết quả.

**Expected Result:**
1. Chỉ 1 transaction thành công (Tạo đơn, trừ kho về 0).
2. Transaction còn lại phải Fail và Rollback (Báo hết hàng).
-> Kho không bị âm (-1).
