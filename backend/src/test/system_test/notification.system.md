# Notification Module - System Test Documentation

## Overview
This document contains End-to-End (E2E) test scenarios for the Notification Module in standardized table format.

**Module:** Notification (Real-time Notifications)  
**Test Type:** System Test / E2E  
**Framework:** Manual Testing / Cypress / Playwright  
**Last Updated:** December 18, 2025

---

## Test Environment Setup

### Configuration
```javascript
// WebSocket Configuration
WEBSOCKET_PORT: 4000
SOCKET_IO_PATH: '/socket.io'
REDIS_URL: 'redis://localhost:6379'
NOTIFICATION_QUEUE: 'notifications'
```

### Test Prerequisites
- WebSocket/Socket.io server running
- Redis for queue management
- Database with Notifications table
- At least 2 test user accounts (User A, User B)

---

## System Test Cases

| Test ID | Test Case Name | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Test Data | Result | Test Date | Note |
|---------|---------------|----------------------|---------------------|-----------------|---------------------------|-----------|--------|-----------|------|
| SYSTEM_NOTIF_REALTIME_01 | Instant Notification Delivery | Kiểm thử nhận thông báo tức thì khi user đang online | 1. **Setup**: User A login trên thiết bị 1 (Desktop/Mobile), keep screen active<br>2. Verify WebSocket connection = "Connected"<br>3. **Action**: User B login trên thiết bị 2<br>4. User B thực hiện action: Like bài viết của User A, hoặc Comment, hoặc Order status update<br>5. **Observation**: Đo thời gian từ action đến khi User A nhận notification<br>6. Kiểm tra UI notification indicator | 1. Thông báo xuất hiện trên màn hình User A trong < **3 giây**<br>2. Biểu tượng chuông hiện **chấm đỏ (unread badge)**<br>3. Không cần F5/Reload, thông báo vẫn hiện (Real-time update)<br>4. Notification popup/toast hiển thị nội dung chính xác<br>5. Sound/Vibration (nếu enabled)<br>6. WebSocket connection stable | None | User A: Receiver (online)<br>User B: Sender (online)<br>Connection: WebSocket<br>Expected latency: < 3s | | | Related: [BE_Other-22]<br>Priority: P0 (Critical) |
| SYSTEM_NOTIF_QUEUE_01 | Offline Queue Processing | Kiểm thử hàng đợi thông báo (Offline → Online) | 1. **Setup**: User A login, verify status = "Online"<br>2. Note current notification count<br>3. **Simulate Offline**: User A ngắt mạng (tắt Wifi/4G hoặc DevTools Offline mode)<br>4. Verify connection status = "Offline/Disconnected"<br>5. **Action While Offline**: User B thực hiện 3-5 actions gửi notification cho User A (message, like, comment)<br>6. **Restore Connection**: User A bật lại mạng<br>7. Wait for auto-reconnect hoặc manual refresh<br>8. Observe notification arrival | 1. Ngay khi có mạng, thông báo từ User B **lập tức xuất hiện**<br>2. Danh sách thông báo **đầy đủ, không bị sót**<br>3. Số unread tăng chính xác (match số actions)<br>4. Thông báo hiển thị **đúng thứ tự thời gian** (chronological)<br>5. Không có duplicate notifications<br>6. WebSocket auto-reconnect thành công | None | User A: Offline → Online<br>User B: Sender<br>Queue: Redis/RabbitMQ<br>Retry: Exponential backoff | | | Related: [BE_Other-23]<br>Queue persistence critical |
| SYSTEM_NOTIF_DEEPLINK_01 | Deep Link Navigation | Kiểm thử click vào thông báo điều hướng đúng trang | 1. **Setup**: User A có notification "Đơn hàng #123 đã được giao"<br>2. Verify notification hiển thị trong notification center/list<br>3. Verify notification status = "Unread"<br>4. **Action**: User A click vào popup thông báo (real-time toast) hoặc notification center<br>5. **Navigation**: Observe page transition, check URL/Route<br>6. Verify page content loaded | 1. Hệ thống mở đúng trang **chi tiết "Đơn hàng #123"**<br>2. URL chính xác: `/orders/123` (Web) hoặc navigate to Order Detail Screen (App)<br>3. Trạng thái notification: "Chưa đọc" → "Đã đọc"<br>4. Notification badge count giảm 1<br>5. Page content hiển thị đúng Order #123<br>6. Không có error/404 | None | Order ID: 123<br>Notification Type: ORDER_DELIVERED<br>Deep Link: /orders/123<br>User: User A | | | Related: [BE_Other-24]<br>Test web & mobile |

---

## Automation Script Examples

### Playwright Example - Real-time Notification
```javascript
import { test, expect } from '@playwright/test';

test('[SYSTEM_NOTIF_REALTIME_01] Instant notification delivery', async ({ browser }) => {
  // User A context
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  
  await pageA.goto('/login');
  await pageA.fill('[name="email"]', 'userA@example.com');
  await pageA.fill('[name="password"]', 'password123');
  await pageA.click('[type="submit"]');
  
  // Wait for WebSocket connection
  await pageA.waitForSelector('[data-connection-status="Connected"]');
  
  // Listen for notification event
  const notificationPromise = pageA.waitForSelector('.notification-toast', { timeout: 5000 });
  
  // User B context (different session)
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  
  await pageB.goto('/login');
  await pageB.fill('[name="email"]', 'userB@example.com');
  await pageB.fill('[name="password"]', 'password123');
  await pageB.click('[type="submit"]');
  
  // User B performs action (like post)
  await pageB.goto('/posts/1');
  
  const startTime = Date.now();
  await pageB.click('[data-testid="like-button"]');
  
  // User A should receive notification
  const notification = await notificationPromise;
  const endTime = Date.now();
  
  const latency = endTime - startTime;
  
  // Assert
  expect(notification).toBeVisible();
  expect(latency).toBeLessThan(3000); // < 3 seconds
  await expect(pageA.locator('[data-testid="notification-badge"]')).toContainText('1');
});
```

### Playwright Example - Offline Queue
```javascript
test('[SYSTEM_NOTIF_QUEUE_01] Offline queue processing', async ({ browser }) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  
  // User A logs in
  await pageA.goto('/login');
  await pageA.fill('[name="email"]', 'userA@example.com');
  await pageA.fill('[name="password"]', 'password123');
  await pageA.click('[type="submit"]');
  
  // Verify online
  await pageA.waitForSelector('[data-connection-status="Connected"]');
  
  // Go offline
  await contextA.setOffline(true);
  await pageA.waitForSelector('[data-connection-status="Offline"]');
  
  // User B sends notifications (while User A offline)
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  
  await pageB.goto('/login');
  await pageB.fill('[name="email"]', 'userB@example.com');
  await pageB.fill('[name="password"]', 'password123');
  await pageB.click('[type="submit"]');
  
  // Send 3 notifications
  for (let i = 0; i < 3; i++) {
    await pageB.click(`[data-testid="action-${i}"]`);
    await pageB.waitForTimeout(500);
  }
  
  // User A goes back online
  await contextA.setOffline(false);
  
  // Wait for reconnection
  await pageA.waitForSelector('[data-connection-status="Connected"]', { timeout: 10000 });
  
  // Wait for notifications to arrive
  await pageA.waitForTimeout(2000);
  
  // Assert all notifications received
  const notificationCount = await pageA.locator('.notification-item').count();
  expect(notificationCount).toBe(3);
  
  // Assert badge updated
  await expect(pageA.locator('[data-testid="notification-badge"]')).toContainText('3');
});
```

### Cypress Example - Deep Link
```javascript
describe('Notification Deep Link Tests', () => {
  it('[SYSTEM_NOTIF_DEEPLINK_01] Deep link navigation', () => {
    cy.login('userA@example.com', 'password123');
    
    // Create notification via API
    cy.request('POST', '/api/test/notifications', {
      userId: 1,
      type: 'ORDER_DELIVERED',
      orderId: 123,
      message: 'Đơn hàng #123 đã được giao'
    });
    
    // Wait for notification to appear
    cy.visit('/notifications');
    cy.get('.notification-item').should('have.length.greaterThan', 0);
    
    // Click notification
    cy.get('.notification-item').first().click();
    
    // Assert navigation
    cy.url().should('include', '/orders/123');
    
    // Assert notification marked as read
    cy.visit('/notifications');
    cy.get('.notification-item').first()
      .should('have.class', 'read');
    
    // Assert badge count decreased
    cy.get('[data-testid="notification-badge"]')
      .should('not.exist'); // or should contain '0'
  });
});
```

---

## Manual Testing Guide

### Test SYSTEM_NOTIF_REALTIME_01: Instant Notification

**Step-by-Step Manual Execution:**

1. **Setup Two Devices/Browsers**
   - Device 1 (User A): Chrome browser, login as `userA@example.com`
   - Device 2 (User B): Firefox browser (or different Chrome profile), login as `userB@example.com`

2. **Verify WebSocket Connection**
   - On Device 1 (User A): Open DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Verify connection to `ws://localhost:4000/socket.io/...`
   - Status should be "101 Switching Protocols" (connected)

3. **Execute Action**
   - On Device 2 (User B): Navigate to User A's post
   - Click "Like" button
   - **Start timer** (use phone stopwatch)

4. **Observe User A Screen**
   - Watch for notification popup/toast on Device 1
   - **Stop timer** when notification appears
   - Record latency

5. **Verify**
   - ✅ Latency < 3 seconds
   - ✅ Notification badge shows red dot
   - ✅ Notification content correct: "User B liked your post"
   - ✅ No page refresh required

---

### Test SYSTEM_NOTIF_QUEUE_01: Offline Queue

**Step-by-Step Manual Execution:**

1. **Setup**
   - User A: Login on laptop, go to homepage
   - Verify notification count (note number)

2. **Simulate Offline**
   - User A: Turn off Wifi or Mobile Data
   - Alternative: DevTools → Network tab → Toggle "Offline" mode
   - Verify connection indicator shows "Offline"

3. **Generate Notifications While Offline**
   - User B (on different device): Send 3 messages to User A
   - User B: Like 2 posts of User A
   - Total: 5 notifications pending

4. **Reconnect**
   - User A: Turn Wifi back on
   - Wait for automatic reconnection (5-10 seconds)
   - Or manually refresh page (F5)

5. **Verify**
   - ✅ All 5 notifications appear immediately
   - ✅ No duplicates
   - ✅ Chronological order preserved
   - ✅ Badge shows +5 increase

---

### Test SYSTEM_NOTIF_DEEPLINK_01: Deep Link Navigation

**Step-by-Step Manual Execution:**

1. **Setup Notification**
   - Use Admin panel or API to create test notification:
     - Type: ORDER_DELIVERED
     - OrderId: 123
     - User: User A

2. **Execute**
   - User A: Login
   - Click notification bell icon
   - See notification: "Đơn hàng #123 đã được giao"
   - **Click on notification**

3. **Verify Navigation**
   - ✅ Browser navigates to `/orders/123`
   - ✅ Order detail page loads with Order #123 info
   - ✅ Notification status changes to "Read" (no longer bold/highlighted)
   - ✅ Badge count decreases by 1

4. **Test Edge Cases**
   - Click notification for deleted order → Should show graceful error (404 page)
   - Click notification for unauthorized order → Should show 403 Forbidden

---

## Test Execution Commands

```bash
# Start backend with WebSocket
npm run start:dev

# Start Redis (required for queue)
redis-server

# Run E2E tests
npx playwright test notification.system.spec.ts

# Run specific test
npx playwright test --grep "SYSTEM_NOTIF_REALTIME"

# Debug mode
npx playwright test --debug --grep "SYSTEM_NOTIF_QUEUE"
```

---

## Environment Requirements

| Requirement | Specification |
|------------|---------------|
| **Backend** | NestJS with Socket.io on port 4000 |
| **WebSocket** | Socket.io v4+ |
| **Queue** | Redis 6+ or RabbitMQ |
| **Database** | PostgreSQL/MySQL with Notifications table |
| **Browsers** | Chrome 120+, Firefox 120+, Safari 17+ |
| **Network** | Stable connection for real-time testing |

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Notification latency | < 3s | User A receives notification after User B action |
| WebSocket reconnect | < 5s | Auto-reconnect after network restored |
| Queue processing | < 2s | Pending notifications delivered after reconnect |
| Deep link navigation | < 1s | Page loads after clicking notification |
| Concurrent users | 100+ | System handles 100+ connected WebSockets |

---

## Test Prioritization

### P0 (Critical) - Real-time Delivery
- SYSTEM_NOTIF_REALTIME_01 (core notification feature)

### P1 (High) - Reliability
- SYSTEM_NOTIF_QUEUE_01 (offline queue critical for UX)
- SYSTEM_NOTIF_DEEPLINK_01 (user navigation)

---

## Notes

- **SYSTEM_NOTIF_REALTIME_01**: Test with multiple browsers/devices for true multi-user simulation
- **SYSTEM_NOTIF_QUEUE_01**: Verify Redis queue persistence (notifications not lost)
- **SYSTEM_NOTIF_DEEPLINK_01**: Test with different notification types (ORDER, COMMENT, LIKE, SYSTEM)
- Use Chrome DevTools Network tab to monitor WebSocket connections
- Test with slow network (throttle to 3G) to verify queue behavior
- For CI/CD: Mock WebSocket events to avoid flaky tests
- Document WebSocket reconnection strategy (exponential backoff: 1s, 2s, 4s, 8s)

---

## Related Documents

- [Notification Unit Tests](../unit_test/notification.unit.spec.ts)
- [Notification Integration Tests](../integration_test/notification.it.spec.ts)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Redis Queue Documentation](https://redis.io/docs/manual/pubsub/)

---

**Document Version**: 2.0 (Table Format)  
**Last Updated**: December 18, 2025  
**Test Framework**: Manual / Cypress / Playwright  
**Maintained By**: Backend QA Team
