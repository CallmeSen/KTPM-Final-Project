import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/modules/users/entities/user.entity';

import { Repository } from 'typeorm';


describe('AuthService Integration Tests', () => {
    let service: AuthService;
    let userRepo: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                    },
                },
                { provide: 'UserService', useValue: { register: jest.fn() } },
                { provide: 'CartService', useValue: { createCart: jest.fn() } },
                { provide: 'MailService', useValue: { sendPasswordResetOtp: jest.fn() } },
                { provide: 'BlacklistRepository', useValue: { save: jest.fn() } },
                { provide: 'JwtService', useValue: { signAsync: jest.fn() } },
                { provide: 'jwtConfig', useValue: {} },
                { provide: 'refreshjwtConfig', useValue: {} },
            ],
        }).compile();

        service = module.get(AuthService);
        userRepo = module.get(getRepositoryToken(User));
    });

    // ===============================
    // Auth-1: Register Success
    // ===============================
    it('[Auth-1] should register user successfully', async () => {
        jest.spyOn(service['userService'], 'register')
            .mockResolvedValue({ id: 'u1' } as any);

        const result = await service.Register({
            email: 'newuser@test.com',
            password: 'Abc@12345',
            username: 'newuser',
        } as any);

        expect(result.message).toContain('Register');
    });

    // ===============================
    // Auth-2: Register Duplicate Email
    // ===============================
    it('[Auth-2] should reject duplicate email', async () => {
        jest.spyOn(service['userService'], 'register')
            .mockRejectedValue(new Error('Email already exists'));

        await expect(
            service.Register({ email: 'exist@test.com' } as any),
        ).rejects.toThrow();
    });

    // ===============================
    // Auth-5: Login Success
    // ===============================
    it('[Auth-5] should login successfully', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValue({
            id: 'u1',
            email: 'test@email.com',
            password: 'hashed',
            role: 'USER',
        } as any);

        jest.spyOn(service, 'generateToken')
            .mockResolvedValue({
                accessToken: 'access',
                refreshToken: 'refresh',
            });



        const result = await service.login({
            email: 'test@email.com',
            password: 'Password123',
        });

        expect(result.access_token).toBeDefined();
    });

    // ===============================
    // Auth-6: Wrong Password
    // ===============================
    it('[Auth-6] should reject wrong password', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValue({
            id: 'u1',
            password: 'hashed',
        } as any);

        await expect(
            service.login({ email: 'test@email.com', password: 'WrongPass' }),
        ).rejects.toThrow();
    });

    // ===============================
    // Auth-29: Reset Password
    // ===============================
    it('[Auth-29] should send reset password email', async () => {
        jest.spyOn(service['Mailservice'], 'sendPasswordResetOtp')
            .mockResolvedValue(undefined);

        const result = await service.ResetPassword('user@test.com');

        expect(result).toBeTruthy();
    });

});
