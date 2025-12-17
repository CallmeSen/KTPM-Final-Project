# Notification Module - System Test Documentation

**Generated from Excel Test Cases:** BE_Other-22 to BE_Other-24 (ST_NOTIF_*)  
**Test Type:** System Tests (Manual/E2E Testing)  
**Framework:** Manual Testing or E2E Framework (Cypress/Playwright)

---

## Test Overview

This document contains **3 System Test scenarios** for the Notification module, focusing on real-time notification delivery and user interaction flows. These tests verify end-to-end functionality including WebSocket connections, offline/online transitions, and deep linking navigation.

---

## [BE_Other-22] ST_NOTIF_Send_Instant

### Test Case Information
- **ID:** ST_NOTIF_Send_Instant
- **Name:** Kiểm thử nhận thông báo tức thì (Online)
- **Objective:** Đảm bảo người dùng nhận được thông báo ngay lập tức khi đang online
- **Technique:** Real-time (Thời gian thực)
- **Type:** System Test

### Preconditions
- User A và User B đều phải Active (đang online)
- WebSocket/Real-time connection được thiết lập cho cả hai users
- Hệ thống notification service đang hoạt động
- Database có dữ liệu user hợp lệ

### Test Data
| Field | Value |
|-------|-------|
| User A | Receiver (người nhận thông báo) |
| User B | Sender (người thực hiện hành động) |
| Connection Type | WebSocket/Socket.io |
| Expected Latency | < 3 seconds |

### Test Procedure
1. **Setup:**
   - User A đăng nhập trên thiết bị 1 (Desktop/Mobile)
   - Mở ứng dụng và giữ màn hình active
   - Verify WebSocket connection status = "Connected"

2. **Action:**
   - User B (hoặc Admin) đăng nhập trên thiết bị 2
   - User B thực hiện hành động kích hoạt thông báo:
     - VD: Like bài viết của User A
     - VD: Comment vào post của User A
     - VD: Order status update cho User A

3. **Observation:**
   - Quan sát màn hình của User A
   - Đo thời gian từ khi User B thực hiện action đến khi User A nhận notification
   - Kiểm tra UI notification indicator

### Expected Output
1. ✅ Thông báo xuất hiện trên màn hình User A trong vòng **< 3 giây**
2. ✅ Biểu tượng chuông thông báo hiện **chấm đỏ (unread badge)**
3. ✅ Không cần F5/Reload trang mà thông báo vẫn hiện (Real-time update)
4. ✅ Notification popup/toast hiển thị với nội dung chính xác
5. ✅ Sound/Vibration notification (nếu enabled trong settings)

### Test Execution Notes
- **Browser Support:** Test trên Chrome, Firefox, Safari, Edge
- **Device Support:** Desktop, Mobile Web, Native App
- **Network Conditions:** Test với WiFi, 4G/5G connection
- **Load Testing:** Verify khi có 100+ concurrent users online

### Failure Scenarios
- ❌ Notification không xuất hiện sau 5 giây
- ❌ WebSocket connection bị disconnect
- ❌ Notification badge không update
- ❌ Wrong notification content/recipient

---

## [BE_Other-23] ST_NOTIF_Send_Offline

### Test Case Information
- **ID:** ST_NOTIF_Send_Offline
- **Name:** Kiểm thử hàng đợi thông báo (Offline -> Online)
- **Objective:** Đảm bảo không mất thông báo khi user mất mạng
- **Technique:** Real-time (Cơ chế Queue/Retry)
- **Type:** System Test

### Preconditions
- User A phải có account hợp lệ trong hệ thống
- Notification queue system đang hoạt động (Redis/RabbitMQ/etc.)
- User B đang online và có thể thực hiện actions

### Test Data
| Field | Value |
|-------|-------|
| User A | Offline mode (ngắt kết nối mạng) |
| User B | Sender (đang online) |
| Queue Type | Redis/RabbitMQ/Database Queue |
| Retry Mechanism | Exponential backoff |

### Test Procedure
1. **Setup:**
   - User A đăng nhập vào hệ thống
   - Verify User A connection status = "Online"
   - Note down current notification count

2. **Simulate Offline:**
   - User A ngắt kết nối mạng:
     - Tắt Wifi
     - Tắt 4G/Mobile Data
     - Hoặc simulate network offline trong DevTools
   - Verify connection status = "Offline/Disconnected"

3. **Action While Offline:**
   - User B thực hiện hành động gửi thông báo cho User A:
     - VD: Send message to User A
     - VD: Like User A's post
     - VD: Admin updates order status
   - Repeat 3-5 actions để tạo multiple notifications

4. **Restore Connection:**
   - User A bật lại mạng (Wifi/4G)
   - Wait for automatic reconnection (or manual refresh)
   - Observe notification arrival

### Expected Output
1. ✅ Ngay khi có mạng trở lại, thông báo từ User B **lập tức xuất hiện**
2. ✅ Danh sách thông báo được cập nhật **đầy đủ, không bị sót**
3. ✅ Số lượng thông báo unread tăng chính xác (match với số actions của User B)
4. ✅ Thông báo hiển thị theo **đúng thứ tự thời gian** (chronological order)
5. ✅ Không có duplicate notifications
6. ✅ WebSocket auto-reconnect thành công

### Test Execution Notes
- **Queue Persistence:** Verify notifications are persisted in database/queue
- **Retry Logic:** Test exponential backoff (1s, 2s, 4s, 8s, etc.)
- **Session Management:** Verify session token still valid after reconnect
- **Offline Duration:** Test với offline periods: 1 minute, 5 minutes, 1 hour

### Failure Scenarios
- ❌ Notification bị mất (loss) khi offline
- ❌ Duplicate notifications sau khi reconnect
- ❌ Thông báo không arrive sau khi online lại
- ❌ WebSocket không tự động reconnect

---

## [BE_Other-24] ST_NOTIF_DeepLink

### Test Case Information
- **ID:** ST_NOTIF_DeepLink
- **Name:** Kiểm thử click vào thông báo (Deep Linking)
- **Objective:** Đảm bảo thông báo điều hướng đúng trang
- **Technique:** Real-time & Navigation
- **Type:** System Test

### Preconditions
- Cần có thông báo đã gửi thành công cho User A
- Deep linking routes đã được config trong application
- Order #123 (hoặc target entity) tồn tại trong database

### Test Data
| Field | Value |
|-------|-------|
| Order ID | 123 |
| Notification Type | ORDER_DELIVERED |
| Deep Link URL | /orders/123 hoặc myapp://orders/123 |
| User A | Receiver |

### Test Procedure
1. **Setup:**
   - User A có notification "Đơn hàng #123 đã được giao"
   - Verify notification hiển thị trong:
     - Notification center/list
     - Popup/Toast notification (if real-time)
   - Verify notification status = "Unread"

2. **Action:**
   - User A click trực tiếp vào **popup thông báo** (real-time toast)
   - Hoặc click vào notification trong **notification center**

3. **Navigation:**
   - Observe page transition
   - Check URL/Route after navigation
   - Verify page content loaded

### Expected Output
1. ✅ Hệ thống mở chính xác trang **chi tiết "Đơn hàng #123"**
2. ✅ URL/Route chính xác:
   - Web: `https://example.com/orders/123`
   - Native App: Navigate to Order Detail Screen with orderId=123
3. ✅ Trạng thái thông báo chuyển từ **"Chưa đọc" (Unread)** sang **"Đã đọc" (Read)**
4. ✅ Notification badge count giảm đi 1
5. ✅ Page content hiển thị đúng thông tin Order #123
6. ✅ Không có error/404 page

### Test Execution Notes
- **Deep Link Types:**
  - Web: HTTP URL with route parameters
  - Mobile: Custom URL scheme (myapp://), Universal Links (iOS), App Links (Android)
- **Notification States:**
  - Click from real-time popup
  - Click from notification center/history
  - Click from push notification (mobile)
- **Edge Cases:**
  - Notification links to deleted entity (Order #123 đã bị xóa)
  - Unauthorized access (User không có quyền xem Order #123)
  - Expired links (notification quá 30 ngày)

### Failure Scenarios
- ❌ Navigate to wrong page/route
- ❌ 404 Not Found error
- ❌ Notification status không update (vẫn hiển thị "Unread")
- ❌ Badge count không giảm
- ❌ Deep link không hoạt động trên mobile app
- ❌ Authorization error (User không có quyền truy cập)

---

## Test Execution Summary

| Test Case ID | Test Name | Status | Priority | Estimated Time |
|-------------|-----------|--------|----------|----------------|
| ST_NOTIF_Send_Instant | Real-time notification delivery | Pending | High | 15 mins |
| ST_NOTIF_Send_Offline | Offline queue & retry mechanism | Pending | High | 20 mins |
| ST_NOTIF_DeepLink | Deep linking navigation | Pending | Medium | 10 mins |

**Total Estimated Time:** 45 minutes

---

## Environment Requirements

### Backend Services
- Notification Service (NestJS/Node.js)
- WebSocket Server (Socket.io/WS)
- Message Queue (Redis/RabbitMQ)
- Database (PostgreSQL/MongoDB)

### Frontend Applications
- Web Application (React/Vue/Angular)
- Mobile App (iOS/Android - if applicable)

### Infrastructure
- HTTPS/WSS enabled
- Load Balancer configured for WebSocket sticky sessions
- CDN for static assets

### Test Tools
- **Manual Testing:** Chrome DevTools, Network throttling
- **E2E Framework:** Cypress, Playwright, Selenium
- **API Testing:** Postman, Insomnia
- **Mobile Testing:** Xcode Simulator, Android Emulator, BrowserStack

---

## Notes for QA Team

1. **Real-time Testing:**
   - Use multiple browser tabs/devices to simulate different users
   - Monitor WebSocket connections in Browser DevTools (Network tab)
   - Check server logs for notification delivery confirmation

2. **Offline Testing:**
   - Use Chrome DevTools "Offline" mode for consistency
   - Test with airplane mode on mobile devices
   - Verify database queue contains pending notifications

3. **Deep Link Testing:**
   - Prepare test data (valid Order IDs, User IDs)
   - Test with different notification types (Order, Comment, Like, System)
   - Verify authorization rules for protected routes

4. **Performance Considerations:**
   - Measure notification latency (target: < 3 seconds)
   - Test with high concurrent users (100+, 1000+)
   - Monitor memory usage for long-running WebSocket connections

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2025  
**Prepared By:** QA Automation Team
