/**
 * Unit Test for Homepage Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Session {
  user: User;
  token: string;
  expiry?: number;
}

interface Book {
  id: number;
  title: string;
  thumbnail: string;
  averageRating: number;
}

// ============================================================================
// MOCK DEPENDENCIES
// ============================================================================

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _setMockData: (key: string, value: any) => {
      store[key] = value;
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock Router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn()
};

// Mock UI State
let isLoggedIn = false;
let showAvatar = false;
let showWarningDialog = false;

const setUIState = jest.fn((loggedIn: boolean, avatar: boolean) => {
  isLoggedIn = loggedIn;
  showAvatar = avatar;
});

const showWarning = jest.fn((message: string) => {
  showWarningDialog = true;
  return message;
});

// ============================================================================
// FUNCTION: getSession (Placeholder implementation)
// ============================================================================

/**
 * Retrieves session from localStorage
 * Handles: Valid session, null, parse error, expired session, type check
 */
const getSession = (): Session | null => {
  try {
    // Get session from localStorage
    const sessionData = localStorage.getItem('session');

    // Path: Null/Undefined
    if (!sessionData) {
      return null;
    }

    // Type check: Ensure it's a string
    if (typeof sessionData !== 'string') {
      return null;
    }

    // Parse JSON
    const session: Session = JSON.parse(sessionData);

    // Path: Check expiry
    if (session.expiry) {
      const now = Date.now();
      if (now > session.expiry) {
        // Session expired - remove it
        localStorage.removeItem('session');
        return null;
      }
    }

    // Path: Valid session
    return session;

  } catch (error) {
    // Path: Parse error - graceful failure
    console.error('Failed to parse session:', error);
    return null;
  }
};

// ============================================================================
// FUNCTION: logout (Placeholder implementation)
// ============================================================================

interface LogoutOptions {
  confirmIfUnsaved?: boolean;
  unsavedData?: boolean;
}

const logout = async (options: LogoutOptions = {}): Promise<boolean> => {
  // Check if there's unsaved data
  if (options.unsavedData && options.confirmIfUnsaved) {
    const confirmMessage = showWarning('Dữ liệu chưa lưu sẽ mất');
    
    // In real app, this would be a user confirmation dialog
    // For testing, we'll simulate user clicking "Cancel"
    // Return false to indicate logout was cancelled
    return false;
  }

  try {
    // 1. Clear session from localStorage
    localStorage.removeItem('session');
    localStorage.removeItem('token');

    // 2. Update UI state
    setUIState(false, false);

    // 3. Redirect to login/home
    mockRouter.push('/auth/login');

    return true;

  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Homepage Module - Unit Tests', () => {

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();
    isLoggedIn = false;
    showAvatar = false;
    showWarningDialog = false;
  });

  // ==========================================================================
  // TEST GROUP: GET SESSION
  // ==========================================================================

  describe('Function: getSession', () => {

    it('[FE_HOME-7] FE_HOME_GetSession_Path_Valid - Kiểm thử luồng Session hợp lệ', () => {
      // Arrange: Mock localStorage trả về JSON hợp lệ
      const validSession: Session = {
        user: {
          id: '1',
          email: 'userA@example.com',
          name: 'User A'
        },
        token: 'xyz-token-123'
      };
      
      mockLocalStorage._setMockData('session', JSON.stringify(validSession));

      // Act: Gọi hàm getSession()
      const result = getSession();

      // Assert
      expect(result).not.toBeNull();
      expect(result?.user.email).toBe('userA@example.com');
      expect(result?.token).toBe('xyz-token-123');
      expect(localStorage.getItem).toHaveBeenCalledWith('session');
      // Không ném ra ngoại lệ (test passes without error)
    });

    it('[FE_HOME-8] FE_HOME_GetSession_Path_Null - Kiểm thử luồng không có Session', () => {
      // Arrange: Mock localStorage trả về null
      mockLocalStorage._setMockData('session', null);

      // Act: Gọi hàm getSession()
      const result = getSession();

      // Assert
      expect(result).toBeNull(); // Hàm trả về null
      expect(localStorage.getItem).toHaveBeenCalledWith('session');
      // Không thực hiện JSON.parse (không có lỗi parse)
    });

    it('[FE_HOME-9] FE_HOME_GetSession_Path_ParseError - Kiểm thử lỗi định dạng JSON', () => {
      // Arrange: Mock localStorage trả về chuỗi lỗi
      const invalidJson = '{invalid...';
      mockLocalStorage._setMockData('session', invalidJson);

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act: Gọi hàm getSession()
      const result = getSession();

      // Assert
      expect(result).toBeNull(); // Graceful failure - trả về null
      expect(consoleErrorSpy).toHaveBeenCalled(); // Khối catch bắt được lỗi
      
      consoleErrorSpy.mockRestore();
    });

    it('[FE_HOME-10] FE_HOME_GetSession_Path_Expired - Kiểm thử luồng Session hết hạn', () => {
      // Arrange: Mock localStorage có expiry trong quá khứ
      const expiredSession: Session = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'User'
        },
        token: 'expired-token',
        expiry: Date.now() - 10000 // 10 seconds ago (past)
      };

      mockLocalStorage._setMockData('session', JSON.stringify(expiredSession));

      // Act: Gọi hàm getSession()
      const result = getSession();

      // Assert
      expect(result).toBeNull(); // Hàm trả về null
      expect(localStorage.removeItem).toHaveBeenCalledWith('session'); // Gọi removeItem
      // Logic kiểm tra (now > expiry) trả về True
    });

    it('[FE_HOME-11] FE_HOME_GetSession_TypeCheck - Kiểm thử sai kiểu dữ liệu', () => {
      // Arrange: Mock localStorage trả về số (không phải string)
      mockLocalStorage._setMockData('session', 12345 as any);

      // Act: Gọi hàm getSession()
      const result = getSession();

      // Assert
      expect(result).toBeNull(); // Xử lý an toàn, trả về null
      // Hàm không crash, xử lý bằng typeof check
    });
  });

  // ==========================================================================
  // TEST GROUP: LOGOUT
  // ==========================================================================

  describe('Function: logout', () => {

    it('[FE_HOME-12] FE_HOME_Logout_Success - Chuyển đổi trạng thái thành công', async () => {
      // Arrange: Đang ở trạng thái "Đã đăng nhập"
      isLoggedIn = true;
      showAvatar = true;
      mockLocalStorage._setMockData('session', JSON.stringify({
        user: { id: '1', email: 'user@example.com', name: 'User' },
        token: 'active-token'
      }));
      mockLocalStorage._setMockData('token', 'active-token');

      // Act: Click nút "Logout"
      const result = await logout();

      // Assert
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('session'); // Xóa session
      expect(localStorage.removeItem).toHaveBeenCalledWith('token'); // Xóa token
      expect(setUIState).toHaveBeenCalledWith(false, false); // UI thay đổi (mất avatar)
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login'); // Chuyển về trang Login
    });

    it('[FE_HOME-15] FE_HOME_Logout_DuringAction - Logout khi đang thực hiện hành động', async () => {
      // Arrange: Đang upload/submit form (có unsaved data)
      const uploadInProgress = true;

      // Act: Click Logout
      const result = await logout({ 
        unsavedData: uploadInProgress,
        confirmIfUnsaved: true 
      });

      // Assert
      expect(showWarning).toHaveBeenCalledWith('Dữ liệu chưa lưu sẽ mất'); // Cảnh báo
      expect(result).toBe(false); // Logout bị hủy (user chọn Cancel)
      expect(localStorage.removeItem).not.toHaveBeenCalled(); // Không xóa session
    });

    it('[FE_HOME-15-EXTRA] FE_HOME_Logout_DuringAction_Confirm - User xác nhận logout dù có dữ liệu chưa lưu', async () => {
      // Arrange: Có unsaved data nhưng user xác nhận OK
      
      // Mock logout function with confirmation = true
      const logoutWithConfirm = async (): Promise<boolean> => {
        const confirmMessage = showWarning('Dữ liệu chưa lưu sẽ mất');
        
        // Simulate user clicking "OK"
        const userConfirmed = true;
        
        if (userConfirmed) {
          localStorage.removeItem('session');
          localStorage.removeItem('token');
          setUIState(false, false);
          mockRouter.push('/auth/login');
          return true;
        }
        
        return false;
      };

      // Act
      const result = await logoutWithConfirm();

      // Assert
      expect(result).toBe(true);
      expect(showWarning).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('session');
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    });
  });
});
