import { onSubmit } from '@/app/page/LoginPage/functions/login-submit-function';
import { logout } from '@/app/page/HomePage/functions/functions';
import { createSession, deleteSession } from '@/lib/session';
import { calculateDiscount, calculateShipping, calculateTotal, createCheckoutPayload, handleQuantityChange } from '@/app/page/CartPage/functions/functions-cartPage';



jest.mock('@/lib/session');
jest.mock('axios');

describe(' SYSTEM TEST - Login → Cart → Logout', () => {
  const router = {
    push: jest.fn(),
  } as any;

  const book = {
    id: 1,
    title: 'Clean Code',
    price: 300,
    authors: 'Robert C. Martin',
    id_stripe: 'stripe_1',
  };

  let cart: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    cart = [
      {
        id: 1,
        book,
        quantity: 1,
      },
    ];
  });

  it('User can login, manage cart, and logout successfully', async () => {
    /* ================= LOGIN ================= */
    await onSubmit(
      { email: 'test@gmail.com', password: '123456' },
      router
    );

    expect(createSession).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/page/HomePage');

    /* ================= CART ================= */

    // Tăng số lượng
    cart = handleQuantityChange(cart, 1, 2);
    expect(cart[0].quantity).toBe(2);

    // Giảm về 0 → xóa khỏi giỏ
    cart = handleQuantityChange(cart, 1, 0);
    expect(cart.length).toBe(0);

    // Thêm lại item để test tính tiền
    cart = [
      { id: 1, book, quantity: 2 },
    ];

    const total = calculateTotal(cart);
    expect(total).toBe(600);

    const discount = calculateDiscount(cart);
    expect(discount).toBe(60); // 10%

    const shipping = calculateShipping(cart);
    expect(shipping).toBe(0); // >300 free ship

    const finalTotal = calculateTotal(cart);
    expect(finalTotal).toBe(540);

    const payload = createCheckoutPayload(
      '2025-01-01',
      'cart-1',
      cart
    );

    expect(payload).toEqual({
      date: '2025-01-01',
      cartId: 'cart-1',
      items: [
        {
          id_stripe: 'stripe_1',
          quantity: 2,
        },
      ],
    });

    /* ================= LOGOUT ================= */
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    } as any);

    const result = await logout('access123');

    expect(deleteSession).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
