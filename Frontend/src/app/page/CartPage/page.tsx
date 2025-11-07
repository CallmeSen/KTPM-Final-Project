'use client'

import { GET_CART_BY_USER } from "@/app/graphQL/queries"
import {  GetCartData } from "@/app/interfaces/cart.interface"
import CartNavbar from "@/app/page/CartPage/navbar-cartpage"
import { useQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { getSession } from "@/lib/session"
import Image from "next/image"
import { Session } from "@/app/interfaces/session.interface"
import { calculateTotal, createCheckoutPayload } from "@/app/page/CartPage/functions/functions-cartPage"
import { useRouter } from "next/navigation"

export default function CartPage() {

    const [session, setSession] = useState<Session | null>(null)

    const [cartItems, setCartItems] = useState<GetCartData["getCartByUser"]["items"]>([])

    const [cartiD, setCartId] = useState<GetCartData["getCartByUser"]["id"]>()

    const router = useRouter();

    useEffect(() => {
        const loadSession = async () => {
            const sess = await getSession()
            setSession(sess)
        }
        loadSession()
    }, [])

    const { data, loading, error, refetch } = useQuery<GetCartData>(GET_CART_BY_USER, {
        variables: { userId: session?.user.id || "" },
        skip: !session?.user.id,
    })


    useEffect(() => {
        if (data?.getCartByUser) {
            setCartItems(data.getCartByUser.items.map(item => ({ ...item })))
            setCartId(data.getCartByUser.id)
        }
    }, [data])


    const isCartEmpty = !cartItems || cartItems.length === 0


    const handleQuantityChange = (id: number, quantity: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: Math.max(quantity, 0) } : item
            )
        )
    }

    const checkout = async () => {

        if (isCartEmpty) {
            alert("Giỏ hàng trống, không thể thanh toán!")
            return
        }

        const now = new Date();

        const date =
            now.getDate().toString().padStart(2, "0") + "/" +
            (now.getMonth() + 1).toString().padStart(2, "0") + "/" +
            now.getFullYear() + "(" +
            now.getHours().toString().padStart(2, "0") + ":" +
            now.getMinutes().toString().padStart(2, "0") + ":" +
            now.getSeconds().toString().padStart(2, "0"); + ")"


        try {

            const payload = createCheckoutPayload(date,cartiD, cartItems);

            const res = await fetch("http://localhost:8000/payment/create-payment-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error("Tạo link thanh toán thất bại")
            }

            const payment_data = await res.json()

            if (payment_data) {
                window.open(payment_data.url, "_blank", "noopener,noreferrer");
            }

        } 

        catch (err) {

            console.error(err)

            alert("Có lỗi khi thanh toán")

        }
    }


    useEffect(() => {
        const handleBeforeUnload = () => {
            if (cartItems.length > 0) {

                console.log("Auto save cartItems:", cartItems)
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [cartItems])

    if (loading) return <div>Loading...</div>

    if (error) return <div>Error: {error.message}</div>

    const totalPrice = calculateTotal(cartItems);

    return (
        <div className="bg-white min-h-screen">
            <CartNavbar />

            {isCartEmpty ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Image
                        src="/assets/empty-cart.jpg"
                        alt="Giỏ hàng trống"
                        width={400}
                        height={300}
                    />
                </div>
            ) : (
                <div className="max-w-6xl mx-auto p-6">

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3 font-semibold text-gray-700">Product</th>
                                <th className="p-3 font-semibold text-gray-700">Name</th>
                                <th className="p-3 font-semibold text-gray-700">Price</th>
                                <th className="p-3 font-semibold text-gray-700">Quantity</th>
                                <th className="p-3 font-semibold text-gray-700">Subtotal</th>
                                <th className="p-3 font-semibold text-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => {
                                const subtotal = item.book.price * item.quantity;
                                return (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">

                                        <td className="p-3 flex items-center gap-3">
                                            {item.book.thumbnail ? (
                                                <Image
                                                    src={item.book.thumbnail}
                                                    alt={item.book.title}
                                                    width={60}
                                                    height={60}
                                                    className="rounded"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded bg-gray-200" />
                                            )}
                                         
                                        </td>

                                        <td className="p-3 text-gray-700">
                                            <span className="font-medium text-[#2F70AF] text-lg">
                                                {item.book.title}
                                            </span>
                                        </td>



                                        <td className="p-3 text-gray-700">
                                            ${item.book.price.toLocaleString()}
                                        </td>


                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, item.quantity - 1)
                                                    }
                                                    className="px-2 border rounded text-black cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <span className="text-black">{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, item.quantity + 1)
                                                    }
                                                    className="px-2 border rounded text-black cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>

                                        <td className="p-3 font-semibold text-gray-800">
                                            ${subtotal.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    
                    <div className="mt-8 max-w-md ml-auto bg-gray-50 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-[#2F70AF]">Cart Totals</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-800">
                                ${totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-lg text-black">
                                ${totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <button
                                    onClick={() => router.push("/page/BookLibrary")}
                                className="flex-1 px-4 py-2 bg-[#FB635D] text-white rounded-lg cursor-pointer"
                            >
                                Return to shop
                            </button>
                            <button
                                onClick={checkout}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

