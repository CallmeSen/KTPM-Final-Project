
import { logout } from '@/app/page/HomePage/functions/functions';
import { deleteSession } from '@/lib/session';

jest.mock('@/lib/session', () => ({
    deleteSession: jest.fn(),
}));

describe('logout', () => {
    const accessToken = 'access123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('✅ logout success → delete session & return true', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
        } as any);

        const result = await logout(accessToken);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8000/auth/logout',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ accessToken }),
                credentials: 'include',
            }
        );

        expect(deleteSession).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('❌ logout failed (res.ok = false) → return false', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
        } as any);

        const result = await logout(accessToken);

        expect(deleteSession).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('❌ logout error (fetch throws) → return false', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const result = await logout(accessToken);

        expect(deleteSession).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });
});
