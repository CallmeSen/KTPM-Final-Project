import { Book } from "@/app/interfaces/Books.interface";
import { CartItem } from "@/app/interfaces/cart.interface";

export interface SavedItem {
    id: number;
    book: Book;
}


export function handleQuantityChange(cart: CartItem[], itemId: number, newQuantity: number): CartItem[] {
    return cart
        .map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: Math.max(newQuantity, 0) };
            }
            return item;
        })
        .filter(item => item.quantity > 0); // xóa nếu quantity = 0
}

export function saveForLater(cart: CartItem[], saved: SavedItem[], itemId: number): { cart: CartItem[], saved: SavedItem[] } {
    const itemToSave = cart.find(item => item.id === itemId);
    if (!itemToSave) return { cart, saved };
    return {
        cart: cart.filter(item => item.id !== itemId),
        saved: [...saved, { id: itemToSave.id, book: itemToSave.book }]
    };
}


export function calculateTotal(cart: CartItem[]): number {
    return cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
}


export function calculateDiscount(cart: CartItem[]): number {
    const total = calculateTotal(cart);
    return total > 500 ? total * 0.1 : 0;
}


export function calculateShipping(cart: CartItem[]): number {
    const total = calculateTotal(cart);
    return total > 300 ? 0 : 20;
}


export function calculateFinalTotal(cart: CartItem[]): number {
    const total = calculateTotal(cart);
    const discount = calculateDiscount(cart);
    const shipping = calculateShipping(cart);
    return total - discount + shipping;
}


export function createCheckoutPayload(date:string,cartId: string | undefined, cart: CartItem[]) {
    return {
        date,
        cartId,
        items: cart.map(item => ({ id_stripe: item.book.id_stripe, quantity: item.quantity })),
    };
}

export function getRecommendedProducts(cart: CartItem[], allBooks: Book[]): Book[] {
    const authorsInCart = new Set(cart.map(item => item.book.authors));
    return allBooks.filter(b => authorsInCart.has(b.authors) && !cart.some(item => item.book.id === b.id));
}
