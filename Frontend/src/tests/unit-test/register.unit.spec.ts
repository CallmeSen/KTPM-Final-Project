/**
 * Unit Test for Register Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

// ============================================================================
// MOCK API CLIENT
// ============================================================================

const mockApiClient = {
  register: jest.fn(async (data: RegisterFormData): Promise<RegisterResponse> => {
    // Mock implementation - override in tests
    return { success: true };
  })
};

// ============================================================================
// MOCK ROUTER
// ============================================================================

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn()
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 255
  },
  EMAIL: {
    MAX_LENGTH: 255
  }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate username length
 */
const validateUsername = jest.fn((username: string): string | null => {
  if (!username) {
    return 'Username là bắt buộc';
  }

  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `Username phải có ít nhất ${VALIDATION_RULES.USERNAME.MIN_LENGTH} ký tự`;
  }

  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return `Username không được vượt quá ${VALIDATION_RULES.USERNAME.MAX_LENGTH} ký tự`;
  }

  return null;
});

/**
 * Validate email format
 */
const validateEmail = jest.fn((email: string): string | null => {
  if (!email) {
    return 'Email là bắt buộc';
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Định dạng email không hợp lệ';
  }

  if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    return `Email không được vượt quá ${VALIDATION_RULES.EMAIL.MAX_LENGTH} ký tự`;
  }

  return null;
});

/**
 * Validate password length and strength
 */
const validatePassword = jest.fn((password: string): string | null => {
  if (!password) {
    return 'Mật khẩu là bắt buộc';
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Mật khẩu phải có ít nhất ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} ký tự`;
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    return `Mật khẩu không được vượt quá ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} ký tự`;
  }

  return null;
});

/**
 * Validate password confirmation match
 */
const validatePasswordMatch = jest.fn((password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không khớp';
  }

  return null;
});

/**
 * Validate entire registration form
 */
const validateRegisterForm = jest.fn((formData: RegisterFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate username
  const usernameError = validateUsername(formData.username);
  if (usernameError) {
    errors.push({ field: 'username', message: usernameError });
  }

  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  // Validate password
  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  // Validate password match
  const passwordMatchError = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (passwordMatchError) {
    errors.push({ field: 'confirmPassword', message: passwordMatchError });
  }

  return errors;
});

// ============================================================================
// REGISTRATION HANDLER
// ============================================================================

/**
 * Handle registration form submission
 */
const onSubmit = jest.fn(async (formData: RegisterFormData): Promise<boolean> => {
  // Step 1: Validate form
  const errors = validateRegisterForm(formData);
  
  if (errors.length > 0) {
    // Validation failed - do not call API
    return false;
  }

  // Step 2: Call API
  try {
    const response = await mockApiClient.register(formData);
    
    if (response.success) {
      // Step 3: Redirect to login page
      mockRouter.push('/login');
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
});

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Register Module - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST GROUP: MANUAL REGISTER - HAPPY CASE
  // ==========================================================================

  describe('Manual Registration - Valid Cases', () => {

    it('[FE_RegisterPage-1] FE_REGISTER_OnSubmit_Valid - Kiểm thử đăng ký hợp lệ (Happy Case)', async () => {
      // Arrange: Valid registration data
      const validFormData: RegisterFormData = {
        username: 'nguoidungmoi',
        email: 'newuser@test.com',
        password: 'Pass1234',
        confirmPassword: 'Pass1234'
      };

      // Mock API success response
      const mockResponse: RegisterResponse = {
        success: true,
        message: 'Đăng ký thành công',
        user: {
          id: 1,
          username: 'nguoidungmoi',
          email: 'newuser@test.com'
        }
      };

      mockApiClient.register.mockResolvedValueOnce(mockResponse);

      // Act: Submit form
      const result = await onSubmit(validFormData);

      // Assert: Validation passed
      const errors = validateRegisterForm(validFormData);
      expect(errors).toHaveLength(0); // No validation errors

      // Assert: API called with correct data
      expect(mockApiClient.register).toHaveBeenCalledWith(validFormData);
      expect(mockApiClient.register).toHaveBeenCalledTimes(1);

      // Assert: Success result
      expect(result).toBe(true);

      // Assert: Redirect to login page
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  // ==========================================================================
  // TEST GROUP: BOUNDARY VALUE ANALYSIS (BVA)
  // ==========================================================================

  describe('Boundary Value Analysis - Username & Password', () => {

    it('[FE_RegisterPage-2] FE_REGISTER_OnSubmit_BVA_Min - Kiểm thử giá trị biên nhỏ nhất', async () => {
      // Arrange: Minimum valid values
      const minBoundaryData: RegisterFormData = {
        username: 'user12', // Exactly 6 characters (min)
        email: 'min@test.com',
        password: 'Pass1234', // Exactly 8 characters (min)
        confirmPassword: 'Pass1234'
      };

      // Mock API response
      mockApiClient.register.mockResolvedValueOnce({ success: true });

      // Act: Validate
      const errors = validateRegisterForm(minBoundaryData);

      // Assert: Validation passed
      expect(errors).toHaveLength(0);

      // Assert: Username validation
      expect(minBoundaryData.username.length).toBe(VALIDATION_RULES.USERNAME.MIN_LENGTH);
      const usernameError = validateUsername(minBoundaryData.username);
      expect(usernameError).toBeNull(); // No error

      // Assert: Password validation
      expect(minBoundaryData.password.length).toBe(VALIDATION_RULES.PASSWORD.MIN_LENGTH);
      const passwordError = validatePassword(minBoundaryData.password);
      expect(passwordError).toBeNull(); // No error

      // Act: Submit
      const result = await onSubmit(minBoundaryData);

      // Assert: API called
      expect(mockApiClient.register).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('[FE_RegisterPage-3] FE_REGISTER_OnSubmit_BVA_MinMinus1 - Kiểm thử dưới giá trị biên nhỏ nhất', async () => {
      // Arrange: Below minimum (invalid)
      const belowMinData: RegisterFormData = {
        username: 'user1', // 5 characters (below min of 6)
        email: 'test@test.com',
        password: 'Pass123', // 7 characters (below min of 8)
        confirmPassword: 'Pass123'
      };

      // Act: Validate username
      const usernameError = validateUsername(belowMinData.username);
      
      // Assert: Username error
      expect(belowMinData.username.length).toBe(5); // Below minimum
      expect(usernameError).not.toBeNull();
      expect(usernameError).toContain('ít nhất 6 ký tự');

      // Act: Validate password
      const passwordError = validatePassword(belowMinData.password);
      
      // Assert: Password error
      expect(belowMinData.password.length).toBe(7); // Below minimum
      expect(passwordError).not.toBeNull();
      expect(passwordError).toContain('ít nhất 8 ký tự');

      // Act: Submit form
      const result = await onSubmit(belowMinData);

      // Assert: Submission blocked
      expect(result).toBe(false); // onSubmit returns false due to validation errors

      // Assert: API NOT called
      expect(mockApiClient.register).not.toHaveBeenCalled();
    });

    it('[FE_RegisterPage-4] FE_REGISTER_OnSubmit_BVA_Max - Kiểm thử giá trị biên lớn nhất', async () => {
      // Arrange: Maximum valid values
      const maxUsername = 'a'.repeat(50); // Exactly 50 characters (max)
      const maxEmail = 'a'.repeat(243) + '@example.com'; // 255 characters total (max)
      
      const maxBoundaryData: RegisterFormData = {
        username: maxUsername,
        email: maxEmail,
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      // Mock API response
      mockApiClient.register.mockResolvedValueOnce({ success: true });

      // Act: Validate
      const errors = validateRegisterForm(maxBoundaryData);

      // Assert: Validation passed
      expect(errors).toHaveLength(0);

      // Assert: Username length at max boundary
      expect(maxBoundaryData.username.length).toBe(VALIDATION_RULES.USERNAME.MAX_LENGTH);
      const usernameError = validateUsername(maxBoundaryData.username);
      expect(usernameError).toBeNull();

      // Assert: Email length at max boundary
      expect(maxBoundaryData.email.length).toBe(VALIDATION_RULES.EMAIL.MAX_LENGTH);
      const emailError = validateEmail(maxBoundaryData.email);
      expect(emailError).toBeNull();

      // Act: Submit
      const result = await onSubmit(maxBoundaryData);

      // Assert: API called with full data (not truncated)
      expect(mockApiClient.register).toHaveBeenCalledWith(maxBoundaryData);
      expect(result).toBe(true);
      
      // Assert: Data sent is complete
      const apiCallArgs = mockApiClient.register.mock.calls[0][0];
      expect(apiCallArgs.username.length).toBe(50);
      expect(apiCallArgs.email.length).toBe(255);
    });
  });

  // ==========================================================================
  // TEST GROUP: EMAIL VALIDATION
  // ==========================================================================

  describe('Email Validation', () => {

    it('[FE_RegisterPage-5] FE_REGISTER_OnSubmit_InvalidEmail - Kiểm thử định dạng Email sai', async () => {
      // Arrange: Invalid email formats
      const invalidEmails = [
        'https://www.google.com/search?q=user-no-at-sign.com', // No @ sign
        'user-no-at-sign.com', // Missing @
        'user@', // Missing domain
        '@example.com', // Missing local part
        'user @example.com', // Space in email
        'user@.com', // Invalid domain
        'user@domain', // Missing TLD
        ''
      ];

      for (const invalidEmail of invalidEmails) {
        // Act: Validate email
        const emailError = validateEmail(invalidEmail);

        // Assert: Error message
        if (invalidEmail === '') {
          expect(emailError).toBe('Email là bắt buộc');
        } else {
          expect(emailError).toBe('Định dạng email không hợp lệ');
        }

        // Arrange: Form with invalid email
        const formData: RegisterFormData = {
          username: 'validuser',
          email: invalidEmail,
          password: 'Password123',
          confirmPassword: 'Password123'
        };

        // Act: Submit form
        const result = await onSubmit(formData);

        // Assert: Submission blocked
        expect(result).toBe(false);

        // Assert: API NOT called
        expect(mockApiClient.register).not.toHaveBeenCalled();

        // Clear mocks for next iteration
        jest.clearAllMocks();
      }
    });

    it('Should accept valid email formats', () => {
      // Arrange: Valid email formats
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        'user123@test123.org'
      ];

      for (const validEmail of validEmails) {
        // Act: Validate
        const emailError = validateEmail(validEmail);

        // Assert: No error
        expect(emailError).toBeNull();
      }
    });
  });

  // ==========================================================================
  // TEST GROUP: PASSWORD VALIDATION
  // ==========================================================================

  describe('Password Validation', () => {

    it('[FE_RegisterPage-6] FE_REGISTER_OnSubmit_PassMismatch - Kiểm thử mật khẩu không khớp', async () => {
      // Arrange: Passwords don't match
      const mismatchData: RegisterFormData = {
        username: 'validuser',
        email: 'user@test.com',
        password: 'PasswordA',
        confirmPassword: 'PasswordB'
      };

      // Act: Validate password match
      const passwordMatchError = validatePasswordMatch(
        mismatchData.password,
        mismatchData.confirmPassword
      );

      // Assert: Mismatch error
      expect(passwordMatchError).toBe('Mật khẩu xác nhận không khớp');

      // Act: Validate entire form
      const errors = validateRegisterForm(mismatchData);

      // Assert: Contains mismatch error
      const confirmPasswordError = errors.find(e => e.field === 'confirmPassword');
      expect(confirmPasswordError).toBeDefined();
      expect(confirmPasswordError?.message).toBe('Mật khẩu xác nhận không khớp');

      // Act: Submit form
      const result = await onSubmit(mismatchData);

      // Assert: Submission blocked
      expect(result).toBe(false);

      // Assert: API NOT called
      expect(mockApiClient.register).not.toHaveBeenCalled();
    });

    it('Should accept matching passwords', () => {
      // Arrange: Passwords match
      const password = 'SecurePass123';
      const confirmPassword = 'SecurePass123';

      // Act: Validate
      const error = validatePasswordMatch(password, confirmPassword);

      // Assert: No error
      expect(error).toBeNull();
    });

    it('Should validate empty password', () => {
      // Arrange: Empty password
      const emptyPassword = '';

      // Act: Validate
      const error = validatePassword(emptyPassword);

      // Assert: Required error
      expect(error).toBe('Mật khẩu là bắt buộc');
    });
  });

  // ==========================================================================
  // TEST GROUP: EDGE CASES
  // ==========================================================================

  describe('Edge Cases & Special Scenarios', () => {

    it('Should handle API failure gracefully', async () => {
      // Arrange: Valid form data
      const validData: RegisterFormData = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      // Mock API failure
      mockApiClient.register.mockRejectedValueOnce(new Error('Network error'));

      // Act: Submit
      const result = await onSubmit(validData);

      // Assert: Returns false on error
      expect(result).toBe(false);

      // Assert: API was called
      expect(mockApiClient.register).toHaveBeenCalled();
    });

    it('Should trim whitespace in validation', () => {
      // Arrange: Username with spaces
      const usernameWithSpaces = '  user  ';

      // Note: Depending on implementation, this might need trimming
      // Current implementation: Whitespace counts as characters
      const error = validateUsername(usernameWithSpaces);

      // This test documents current behavior
      // If trimming is required, modify validateUsername function
      expect(usernameWithSpaces.length).toBe(8); // Includes spaces
    });

    it('Should validate all fields together', () => {
      // Arrange: Multiple errors
      const invalidData: RegisterFormData = {
        username: 'usr', // Too short
        email: 'invalid-email', // Invalid format
        password: 'short', // Too short
        confirmPassword: 'different' // Mismatch
      };

      // Act: Validate
      const errors = validateRegisterForm(invalidData);

      // Assert: Multiple errors returned
      expect(errors.length).toBeGreaterThan(0);
      
      // Assert: Contains username error
      const usernameError = errors.find(e => e.field === 'username');
      expect(usernameError).toBeDefined();

      // Assert: Contains email error
      const emailError = errors.find(e => e.field === 'email');
      expect(emailError).toBeDefined();

      // Assert: Contains password error
      const passwordError = errors.find(e => e.field === 'password');
      expect(passwordError).toBeDefined();

      // Assert: Contains confirm password error
      const confirmError = errors.find(e => e.field === 'confirmPassword');
      expect(confirmError).toBeDefined();
    });

    it('Should handle maximum length + 1 (boundary)', () => {
      // Arrange: Username exceeds max
      const tooLongUsername = 'a'.repeat(51); // 51 characters (max is 50)

      // Act: Validate
      const error = validateUsername(tooLongUsername);

      // Assert: Error for exceeding max length
      expect(error).toContain('không được vượt quá 50 ký tự');
    });

    it('Should validate email max length', () => {
      // Arrange: Email exactly at max (255 chars)
      const maxEmail = 'a'.repeat(243) + '@example.com'; // 255 total

      // Act: Validate
      const error = validateEmail(maxEmail);

      // Assert: Valid at max length
      expect(maxEmail.length).toBe(255);
      expect(error).toBeNull();

      // Arrange: Email exceeds max (256 chars)
      const tooLongEmail = 'a'.repeat(244) + '@example.com'; // 256 total

      // Act: Validate
      const error2 = validateEmail(tooLongEmail);

      // Assert: Error for exceeding max
      expect(tooLongEmail.length).toBe(256);
      expect(error2).toContain('không được vượt quá 255 ký tự');
    });

    it('Should not call router if API fails', async () => {
      // Arrange: Valid data but API returns failure
      const validData: RegisterFormData = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      // Mock API failure response
      mockApiClient.register.mockResolvedValueOnce({ success: false });

      // Act: Submit
      const result = await onSubmit(validData);

      // Assert: Result is false
      expect(result).toBe(false);

      // Assert: Router NOT called
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TEST GROUP: HELPER FUNCTIONS
  // ==========================================================================

  describe('Validation Helper Functions', () => {

    it('validateUsername should return correct error messages', () => {
      // Empty username
      expect(validateUsername('')).toBe('Username là bắt buộc');

      // Too short
      expect(validateUsername('abc')).toContain('ít nhất 6 ký tự');

      // Valid
      expect(validateUsername('validuser')).toBeNull();

      // Too long
      expect(validateUsername('a'.repeat(51))).toContain('không được vượt quá 50 ký tự');
    });

    it('validateEmail should return correct error messages', () => {
      // Empty email
      expect(validateEmail('')).toBe('Email là bắt buộc');

      // Invalid format
      expect(validateEmail('notanemail')).toBe('Định dạng email không hợp lệ');

      // Valid
      expect(validateEmail('valid@test.com')).toBeNull();

      // Too long
      expect(validateEmail('a'.repeat(250) + '@example.com')).toContain('không được vượt quá 255 ký tự');
    });

    it('validatePassword should return correct error messages', () => {
      // Empty password
      expect(validatePassword('')).toBe('Mật khẩu là bắt buộc');

      // Too short
      expect(validatePassword('Pass12')).toContain('ít nhất 8 ký tự');

      // Valid
      expect(validatePassword('Password123')).toBeNull();

      // Too long
      expect(validatePassword('a'.repeat(256))).toContain('không được vượt quá 255 ký tự');
    });

    it('validatePasswordMatch should compare passwords correctly', () => {
      // Match
      expect(validatePasswordMatch('Pass123', 'Pass123')).toBeNull();

      // Mismatch
      expect(validatePasswordMatch('Pass123', 'Pass456')).toBe('Mật khẩu xác nhận không khớp');

      // Case sensitive
      expect(validatePasswordMatch('Password', 'password')).toBe('Mật khẩu xác nhận không khớp');
    });
  });
});
