import { CartItem } from "@/app/interfaces/cart.interface";
import { calculateDiscount, calculateFinalTotal, calculateShipping, calculateTotal, createCheckoutPayload, getRecommendedProducts, handleQuantityChange, saveForLater } from "@/app/page/CartPage/functions/functions-cartPage";


const mockCart: CartItem[] = [
  { id: 1, quantity: 2, book: { id: '1', title: 'Book 1', authors: 'Author 1', average_rating: 4.5, published_year: 2020, description: 'Desc', thumbnail: 'img1.jpg', num_pages: 250, ratings_count: 100, price: 100, id_stripe: 'stripe1' } },
  { id: 2, quantity: 3, book: { id: '2', title: 'Book 2', authors: 'Author 2', average_rating: 4.0, published_year: 2021, description: 'Desc', thumbnail: 'img2.jpg', num_pages: 300, ratings_count: 150, price: 200, id_stripe: 'stripe2' } },
];

describe('CartPage functions', () => {

  test('handleQuantityChange tăng quantity', () => {
    const newCart = handleQuantityChange(mockCart, 1, 5);
    expect(newCart.find(i => i.id === 1)?.quantity).toBe(5);
  });

  test('handleQuantityChange giảm quantity', () => {
    const newCart = handleQuantityChange(mockCart, 2, 1);
    expect(newCart.find(i => i.id === 2)?.quantity).toBe(1);
  });

  test('handleQuantityChange xóa sản phẩm nếu quantity = 0', () => {
    const newCart = handleQuantityChange(mockCart, 1, 0);
    expect(newCart.find(i => i.id === 1)).toBeUndefined();
  });

  test('calculateTotal trả về tổng tiền', () => {
    expect(calculateTotal(mockCart)).toBe(2 * 100 + 3 * 200);
  });

  test('calculateDiscount trả về giảm giá đúng', () => {
    expect(calculateDiscount(mockCart)).toBe((2 * 100 + 3 * 200) * 0.1);
  });

  test('calculateShipping trả phí đúng', () => {
    expect(calculateShipping(mockCart)).toBe(0); 
  });

  test('calculateFinalTotal trả tổng thanh toán', () => {
    expect(calculateFinalTotal(mockCart)).toBe((2 * 100 + 3 * 200) - (2 * 100 + 3 * 200) * 0.1 + 0);
  });

  test('createCheckoutPayload trả payload đúng', () => {
    const payload = createCheckoutPayload('cart123', mockCart);
    expect(payload).toEqual({
      cartId: 'cart123',
      items: [
        { id_stripe: 'stripe1', quantity: 2 },
        { id_stripe: 'stripe2', quantity: 3 },
      ],
    });
  });

  test('saveForLater chuyển sản phẩm vào saved', () => {
    const saved: any[] = [];
    const { cart, saved: newSaved } = saveForLater(mockCart, saved, 1);
    expect(cart.find(i => i.id === 1)).toBeUndefined();
    expect(newSaved.find(i => i.id === 1)).toBeDefined();
  });

  test('getRecommendedProducts gợi ý đúng', () => {
    const allBooks = [
      { id: '3', title: 'Book 3', authors: 'Author 1', average_rating: 4, published_year: 2022, description: 'Desc', thumbnail: '', num_pages: 100, ratings_count: 50, price: 150, id_stripe: 'stripe3' },
      { id: '4', title: 'Book 4', authors: 'Author 3', average_rating: 5, published_year: 2021, description: 'Desc', thumbnail: '', num_pages: 200, ratings_count: 20, price: 120, id_stripe: 'stripe4' },
    ];
    const recommended = getRecommendedProducts(mockCart, allBooks);
    expect(recommended.map(b => b.id)).toEqual(['3']);
  });

});
