
import { onSubmit } from '@/app/page/LoginPage/functions/login-submit-function';
import { createSession } from '@/lib/session';

jest.mock('@/lib/session');

describe('Integration Test - Login', () => {
    const mockRouter = {
        push: jest.fn(),
    } as any;

    const validUser = {
        email: 'test@gmail.com',
        password: '123456',
    };

    const invalidUser = {
        email: 'wrong@gmail.com',
        password: 'wrong',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('✅ login success → create session & redirect', async () => {
        await onSubmit(validUser, mockRouter);

        expect(createSession).toHaveBeenCalledWith({
            user: { id: 1, email: 'test@gmail.com' },
            accessToken: 'access123',
            refreshToken: 'refresh123',
        });

        expect(mockRouter.push).toHaveBeenCalledWith('/page/HomePage');
    });

    it('❌ login failed → show alert', async () => {
        await onSubmit(invalidUser, mockRouter);

        expect(createSession).not.toHaveBeenCalled();
        expect(mockRouter.push).not.toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Invalid credentials');
    });
});
