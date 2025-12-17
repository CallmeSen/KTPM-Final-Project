import { Test, TestingModule } from '@nestjs/testing';

// ---------------------------------------------------------
// MOCK INTERFACES & HELPER FUNCTIONS
// ---------------------------------------------------------

interface CartItem {
    product_id: string;
    qty: number;
    price: number;
}

// Function under test
function countCartItems(items: CartItem[] | null): number {
    if (!items) return 0; // Handle null
    let total = 0;
    for (const item of items) {
        if (item.qty > 0) { // Ignore negative numbers
            total += item.qty;
        }
    }
    return total;
}

// ---------------------------------------------------------
// UNIT TEST SUITE
// ---------------------------------------------------------
describe('Cart Module - Unit Tests', () => {

    // [Cart-11] UT_CART_CountItems_Empty
    describe('countCartItems - Empty List', () => {
        it('should return 0 when list is empty', () => {
            // 1. Khởi tạo danh sách giỏ hàng: cartItems = []
            const cartItems: CartItem[] = [];

            // 2. Gọi hàm: int result = countCartItems(cartItems)
            const result = countCartItems(cartItems);

            // 3. Kiểm tra giá trị result
            expect(result).toBe(0);
        });
    });

    // [Cart-12] UT_CART_CountItems_Sum
    describe('countCartItems - Sum Logic', () => {
        it('should correctly sum quantities', () => {
            // 1. Khởi tạo danh sách items
            const items: CartItem[] = [
                { product_id: 'A', qty: 2, price: 10 },
                { product_id: 'B', qty: 5, price: 20 },
                { product_id: 'C', qty: 1, price: 5 },
            ];

            // 2. Gọi hàm countCartItems(items)
            const result = countCartItems(items);

            // 3. Kết quả trả về chính xác là 8
            expect(result).toBe(8);
        });
    });

    // [Cart-13] UT_CART_CountItems_Null
    describe('countCartItems - Null Handling', () => {
        it('should return 0 or handle exception when input is null', () => {
            // 1. Gọi hàm với tham số null
            const result = countCartItems(null);

            // 2. Quan sát phản hồi của hàm (Expect 0 based on implementation)
            expect(result).toBe(0);
        });
    });

    // [Cart-14] UT_CART_CountItems_Invalid
    describe('countCartItems - Invalid Data (Negative)', () => {
        it('should ignore negative quantities', () => {
            // 1. Khởi tạo danh sách
            const items: CartItem[] = [
                { product_id: 'A', qty: 3, price: 10 },
                { product_id: 'B', qty: -5, price: 20 }, // Lỗi data
            ];

            // 2. Gọi hàm countCartItems(items)
            const result = countCartItems(items);

            // 3. Mong đợi: Bỏ qua số âm -> Trả về 3
            expect(result).toBe(3);
        });
    });

});
