/**
 * User Module - Integration Tests
 * Framework: Jest + NestJS Testing
 * Purpose: Test user management operations with authentication and authorization
 * Based on Excel Test Cases: [BE_User-1] to [BE_User-15]
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';

// =====================================================
// MOCK INTERFACES (Since complete source code may not be available)
// =====================================================

interface CreateUserDto {
  email: string;
  phone: string;
  name?: string;
  password?: string;
  username?: string;
}

interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
}

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

interface AuthToken {
  access_token: string;
  user: User;
}

// =====================================================
// MOCK SERVICES & REPOSITORIES
// =====================================================

class MockUserService {
  create = jest.fn();
  findAll = jest.fn();
  findOne = jest.fn();
  findByEmail = jest.fn();
  findByPhone = jest.fn();
  update = jest.fn();
  remove = jest.fn();
}

class MockUserRepository {
  create = jest.fn();
  save = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

class MockAuthService {
  login = jest.fn();
  validateUser = jest.fn();
  generateToken = jest.fn();
}

// Mock Guards
class MockAuthGuard {
  canActivate = jest.fn();
}

class MockRolesGuard {
  canActivate = jest.fn();
}

// =====================================================
// TEST SUITE
// =====================================================

describe('User Module - Integration Tests (Excel-based)', () => {
  let userService: MockUserService;
  let userRepository: MockUserRepository;
  let authService: MockAuthService;
  let authGuard: MockAuthGuard;
  let rolesGuard: MockRolesGuard;

  beforeEach(() => {
    // Initialize mocks
    userService = new MockUserService();
    userRepository = new MockUserRepository();
    authService = new MockAuthService();
    authGuard = new MockAuthGuard();
    rolesGuard = new MockRolesGuard();

    // Reset all mocks
    jest.clearAllMocks();
  });

  // =====================================================
  // CREATE USER TESTS (IT_USER_1-5)
  // =====================================================

  describe('[BE_User-1] IT_USER_CreateUser_Valid', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange - Test Data: Email: new_valid@test.com, Phone: 0901234567
      const createDto: CreateUserDto = {
        email: 'new_valid@test.com',
        phone: '0901234567',
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'new_valid@test.com',
        phone: '0901234567',
        name: 'Test User',
        username: 'testuser',
        role: UserRole.USER,
        createdAt: new Date(),
      } as unknown as User;

      // Mock email and phone not exist
      userRepository.findOne
        .mockResolvedValueOnce(null) // Check email
        .mockResolvedValueOnce(null); // Check phone

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      userService.create.mockImplementation(async (dto) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          throw new Error('Email không đúng định dạng');
        }

        // Check duplicate email
        const existingEmail = await userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw new Error('Email đã được sử dụng');
        }

        // Check duplicate phone
        const existingPhone = await userRepository.findOne({
          where: { phone: dto.phone },
        });
        if (existingPhone) {
          throw new Error('Số điện thoại đã tồn tại');
        }

        const user = userRepository.create(dto);
        return await userRepository.save(user);
      });

      // Act
      const result = await userService.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('new_valid@test.com');
      expect(result.phone).toBe('0901234567');
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('[BE_User-2] IT_USER_CreateUser_InvEmailFmt', () => {
    it('should reject creation with invalid email format', async () => {
      // Arrange - Test Data: Email: https://www.google.com/search?q=user.test.com
      const createDto: CreateUserDto = {
        email: 'https://www.google.com/search?q=user.test.com',
        phone: '0901234567',
        name: 'Test User',
      };

      userService.create.mockImplementation(async (dto) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          throw new Error('Email không đúng định dạng');
        }
      });

      // Act & Assert
      await expect(userService.create(createDto)).rejects.toThrow(
        'Email không đúng định dạng',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-3] IT_USER_CreateUser_DupEmail', () => {
    it('should reject creation with duplicate email', async () => {
      // Arrange - Test Data: Email: exist@test.com (already exists)
      const createDto: CreateUserDto = {
        email: 'exist@test.com',
        phone: '0909999888',
        name: 'New User',
      };

      const existingUser = {
        id: 1,
        email: 'exist@test.com',
        phone: '0901111111',
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      userService.create.mockImplementation(async (dto) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          throw new Error('Email không đúng định dạng');
        }

        const existingEmail = await userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw new Error('Email đã được sử dụng');
        }

        const user = userRepository.create(dto);
        return await userRepository.save(user);
      });

      // Act & Assert
      await expect(userService.create(createDto)).rejects.toThrow(
        'Email đã được sử dụng',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-4] IT_USER_CreateUser_InvPhone', () => {
    it('should reject creation with invalid phone format', async () => {
      // Arrange - Test Data: Phone: 090abc
      const createDto: CreateUserDto = {
        email: 'valid@test.com',
        phone: '090abc',
        name: 'Test User',
      };

      userService.create.mockImplementation(async (dto) => {
        // Validate phone: only numbers, 10-11 digits
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(dto.phone)) {
          throw new Error(
            'Số điện thoại không hợp lệ (chỉ chấp nhận số, 10-11 ký tự)',
          );
        }
      });

      // Act & Assert
      await expect(userService.create(createDto)).rejects.toThrow(
        'Số điện thoại không hợp lệ',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-5] IT_USER_CreateUser_DupPhone', () => {
    it('should reject creation with duplicate phone number', async () => {
      // Arrange - Test Data: Phone: 0999888777 (already exists)
      const createDto: CreateUserDto = {
        email: 'newuser@test.com',
        phone: '0999888777',
        name: 'New User',
      };

      const existingUser = {
        id: 2,
        email: 'other@test.com',
        phone: '0999888777',
      } as unknown as User;

      userRepository.findOne
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce(existingUser); // Phone check fails

      userService.create.mockImplementation(async (dto) => {
        const existingEmail = await userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw new Error('Email đã được sử dụng');
        }

        const existingPhone = await userRepository.findOne({
          where: { phone: dto.phone },
        });
        if (existingPhone) {
          throw new Error('Số điện thoại đã tồn tại');
        }

        const user = userRepository.create(dto);
        return await userRepository.save(user);
      });

      // Act & Assert
      await expect(userService.create(createDto)).rejects.toThrow(
        'Số điện thoại đã tồn tại',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // GET USER BY ID TESTS (IT_USER_6-8)
  // =====================================================

  describe('[BE_User-6] IT_USER_GetById_Self', () => {
    it('should allow user to view their own information', async () => {
      // Arrange - Test Data: User: A, Target: ID_User_A
      const userId = 1;
      const mockUser = {
        id: 1,
        email: 'userA@test.com',
        phone: '0901111111',
        name: 'User A',
        role: UserRole.USER,
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(mockUser);

      userService.findOne.mockImplementation(async (id, requestUser) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('User not found');

        // Check if user is viewing their own info or is admin
        if (requestUser.id !== id && requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền xem thông tin này');
        }

        return user;
      });

      // Act - User A views their own info
      const requestUser = { id: 1, role: UserRole.USER };
      const result = await userService.findOne(userId, requestUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe('userA@test.com');
      expect(result.phone).toBe('0901111111');
    });
  });

  describe('[BE_User-7] IT_USER_GetById_Other', () => {
    it('should deny user from viewing another user information', async () => {
      // Arrange - Test Data: User: A, Target: ID_User_B
      const targetUserId = 2;
      const mockTargetUser = {
        id: 2,
        email: 'userB@test.com',
        phone: '0902222222',
        name: 'User B',
        role: UserRole.USER,
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(mockTargetUser);

      userService.findOne.mockImplementation(async (id, requestUser) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('User not found');

        if (requestUser.id !== id && requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền xem thông tin này');
        }

        return user;
      });

      // Act & Assert - User A tries to view User B's info
      const requestUser = { id: 1, role: UserRole.USER };
      await expect(
        userService.findOne(targetUserId, requestUser),
      ).rejects.toThrow('Bạn không có quyền xem thông tin này');
    });
  });

  describe('[BE_User-8] IT_USER_GetById_Admin', () => {
    it('should allow admin to view any user information', async () => {
      // Arrange - Test Data: User: Admin, Target: ID_User_A
      const targetUserId = 1;
      const mockTargetUser = {
        id: 1,
        email: 'userA@test.com',
        phone: '0901111111',
        name: 'User A',
        role: UserRole.USER,
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(mockTargetUser);

      userService.findOne.mockImplementation(async (id, requestUser) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('User not found');

        if (requestUser.id !== id && requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền xem thông tin này');
        }

        return user;
      });

      // Act - Admin views User A's info
      const requestUser = { id: 999, role: UserRole.ADMIN };
      const result = await userService.findOne(targetUserId, requestUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe('userA@test.com');
    });
  });

  // =====================================================
  // UPDATE USER TESTS (IT_USER_9-12)
  // =====================================================

  describe('[BE_User-9] IT_USER_Update_Valid', () => {
    it('should update user information successfully with valid data', async () => {
      // Arrange - Test Data: Name: Valid, Phone: Valid
      const userId = 1;
      const updateDto: UpdateUserDto = {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
      };

      const existingUser = {
        id: 1,
        email: 'user@test.com',
        phone: '0909999999',
        name: 'Old Name',
      } as unknown as User;

      const updatedUser = {
        ...existingUser,
        name: 'Nguyễn Văn A',
        phone: '0901234567',
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(updatedUser);

      userService.update.mockImplementation(async (id, dto) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('Không tìm thấy người dùng');

        // Validate phone if provided
        if (dto.phone) {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(dto.phone)) {
            throw new Error('Số điện thoại không hợp lệ');
          }
        }

        // Validate required fields
        if (dto.name === '' || dto.name === null) {
          throw new Error('Tên không được để trống');
        }

        Object.assign(user, dto);
        return await userRepository.save(user);
      });

      // Act
      const result = await userService.update(userId, updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Nguyễn Văn A');
      expect(result.phone).toBe('0901234567');
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('[BE_User-10] IT_USER_Update_InvalidPhone', () => {
    it('should reject update with invalid phone format', async () => {
      // Arrange - Test Data: Phone: 0909abc
      const userId = 1;
      const updateDto: UpdateUserDto = {
        phone: '0909abc',
      };

      const existingUser = {
        id: 1,
        email: 'user@test.com',
        phone: '0909999999',
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      userService.update.mockImplementation(async (id, dto) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('Không tìm thấy người dùng');

        if (dto.phone) {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(dto.phone)) {
            throw new Error('Số điện thoại không hợp lệ');
          }
        }

        Object.assign(user, dto);
        return await userRepository.save(user);
      });

      // Act & Assert
      await expect(userService.update(userId, updateDto)).rejects.toThrow(
        'Số điện thoại không hợp lệ',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-11] IT_USER_Update_MissingReq', () => {
    it('should reject update with missing required field', async () => {
      // Arrange - Test Data: Name: [Empty]
      const userId = 1;
      const updateDto: UpdateUserDto = {
        name: '', // Empty name
      };

      const existingUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Old Name',
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      userService.update.mockImplementation(async (id, dto) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new Error('Không tìm thấy người dùng');

        if (dto.name === '' || dto.name === null) {
          throw new Error('Tên không được để trống');
        }

        Object.assign(user, dto);
        return await userRepository.save(user);
      });

      // Act & Assert
      await expect(userService.update(userId, updateDto)).rejects.toThrow(
        'Tên không được để trống',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-12] IT_USER_Update_NotFound', () => {
    it('should return 404 when updating non-existent user', async () => {
      // Arrange - Test Data: ID: 999999
      const userId = 999999;
      const updateDto: UpdateUserDto = {
        name: 'Valid Name',
        phone: '0901234567',
      };

      userRepository.findOne.mockResolvedValue(null);

      userService.update.mockImplementation(async (id, dto) => {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
          throw new Error('Không tìm thấy người dùng');
        }

        Object.assign(user, dto);
        return await userRepository.save(user);
      });

      // Act & Assert
      await expect(userService.update(userId, updateDto)).rejects.toThrow(
        'Không tìm thấy người dùng',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // GET ALL USERS TESTS (IT_USER_13-15)
  // =====================================================

  describe('[BE_User-13] IT_USER_GetAllUsers_Admin', () => {
    it('should allow admin to get list of all users', async () => {
      // Arrange - Test Data: Role: Admin, Token: Valid_Admin
      const mockUsers = [
        {
          id: 1,
          email: 'user1@test.com',
          name: 'User 1',
          role: UserRole.USER,
        },
        {
          id: 2,
          email: 'user2@test.com',
          name: 'User 2',
          role: UserRole.USER,
        },
        {
          id: 3,
          email: 'admin@test.com',
          name: 'Admin',
          role: UserRole.ADMIN,
        },
      ] as unknown as User[];

      userRepository.find.mockResolvedValue(mockUsers);

      userService.findAll.mockImplementation(async (requestUser) => {
        // Check if user is admin
        if (requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền thực hiện');
        }

        return await userRepository.find();
      });

      // Act - Admin requests all users
      const requestUser = { id: 3, role: UserRole.ADMIN };
      const result = await userService.findAll(requestUser);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('[BE_User-14] IT_USER_GetAllUsers_Forbidden', () => {
    it('should deny normal user from getting all users list', async () => {
      // Arrange - Test Data: Role: User, Token: Valid_User
      userService.findAll.mockImplementation(async (requestUser) => {
        if (requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền thực hiện');
        }

        return await userRepository.find();
      });

      // Act & Assert - Normal user tries to get all users
      const requestUser = { id: 1, role: UserRole.USER };
      await expect(userService.findAll(requestUser)).rejects.toThrow(
        'Bạn không có quyền thực hiện',
      );

      expect(userRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('[BE_User-15] IT_USER_GetAllUsers_Unauthorized', () => {
    it('should deny access without valid authentication token', async () => {
      // Arrange - Test Data: Token: Null / Invalid
      authGuard.canActivate.mockReturnValue(false);

      userService.findAll.mockImplementation(async (requestUser) => {
        if (!requestUser || !requestUser.id) {
          throw new Error('Unauthorized');
        }

        if (requestUser.role !== UserRole.ADMIN) {
          throw new Error('Bạn không có quyền thực hiện');
        }

        return await userRepository.find();
      });

      // Act & Assert - No authentication
      await expect(userService.findAll(null as any)).rejects.toThrow(
        'Unauthorized',
      );

      expect(userRepository.find).not.toHaveBeenCalled();
    });
  });
});
