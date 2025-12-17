
# System Test Scenarios - Auth Module

These scenarios represent End-to-End (E2E) flows that involve User Interface interactions, 3rd Party Redirects, or Cross-System checks. They are best executed using manual testing or E2E automation tools like Cypress/Playwright.

## [BE_Auth-19] IT_AUTH_GoogleLogin_Success
**Title:** Đăng nhập Google thành công
**Objective:** Kiểm tra luồng tích hợp hoàn chỉnh (Redirect & Callback).
**Pre-condition:** Tài khoản Google đang active (valid_user@gmail.com).

**Steps:**
1. Open Login Page.
2. Click nút "Login with Google".
3. Verify system redirects to `accounts.google.com`.
4. Enter valid Google credentials and click "Allow/Chấp nhận".
5. Verify Google redirects back to the application (Redirect URI).

**Expected Result:**
- Backend processes the code and returns a Token.
- User is logged in successfully.
- User is redirected to the Dashboard/Home page.

---

## [BE_Auth-20] IT_AUTH_GoogleLogin_Deny
**Title:** Người dùng từ chối cấp quyền
**Objective:** Kiểm tra xử lý khi user hủy thao tác bên thứ 3.
**Pre-condition:** None.

**Steps:**
1. Open Login Page.
2. Click nút "Login with Google".
3. On Google consent screen, click "Cancel" or "Deny".

**Expected Result:**
- Google redirects back to the application Login page.
- No Token is generated.
- Error message displayed: "Đăng nhập bị hủy hoặc thất bại".

---

## [BE_Auth-21] IT_AUTH_GoogleLogin_NewUser
**Title:** Đăng ký tự động qua Google
**Objective:** Kiểm tra logic tạo mới User khi email chưa tồn tại trong DB.
**Pre-condition:** Gmail `new_user@gmail.com` MUST NOT exist in the system DB.

**Steps:**
1. Prepare a Gmail account that has never registered on the system.
2. Perform "Login with Google" flow successfully.
3. Access Database (Admin tool).
4. Query the `Users` table.

**Expected Result:**
- Login successful.
- A new record is created in `Users` table with `email = new_user@gmail.com`.
- The `Source` or `Provider` field is set to 'Google'.
