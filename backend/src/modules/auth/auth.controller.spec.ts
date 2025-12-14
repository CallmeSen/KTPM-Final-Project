import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    Register: jest.fn(),
    login: jest.fn(),
    AdminLogin: jest.fn(),
    LogOut: jest.fn(),
    refreshToken: jest.fn(),
    resetPassword: jest.fn(),
    generateAccesstoken: jest.fn(),
    generateToken: jest.fn(),
    ResetPassword: jest.fn(),
    checkPostcode: jest.fn(),
  };

  const userServiceMock = {
    checkEmailExist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
