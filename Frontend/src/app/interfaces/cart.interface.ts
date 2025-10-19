import { Book } from "@/app/interfaces/Books.interface"


export interface CartItem {
    id: number
    quantity: number
    book: Book
}

export interface Cart {
    id: string
    userId: string
    totalPrice: number
    items: CartItem[]
}

export interface GetCartData {
    getCartByUser: Cart
}
