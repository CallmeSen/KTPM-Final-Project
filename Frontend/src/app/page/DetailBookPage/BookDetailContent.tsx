"use client";
import { ADD_CART_ITEM, GET_CART_BY_USER, GETBook } from "@/app/graphQL/queries";
import { GetBookData } from "@/app/interfaces/Books.interface";
import Footer from "@/Shared/Footer/page";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import { GetCartData } from "@/app/interfaces/cart.interface";
import { Session } from "@/app/interfaces/session.interface";
import Navbar from "@/app/page/HomePage/components/NavBar/page";
import CommentSection from "@/app/page/DetailBookPage/components/Comment_section";
import { useRouter, useSearchParams } from "next/navigation";

export default function BookDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookId = searchParams.get("id");

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const loadSession = async () => {
            const sess = await getSession();
            setSession(sess);
        };
        loadSession();
    }, []);

    const { data, loading, error } = useQuery<GetBookData>(GETBook, {
        variables: { id: bookId },
        skip: !bookId,
    });

    const {
        data: cartData,
        loading: cartLoading,
        error: cartError,
    } = useQuery<GetCartData>(GET_CART_BY_USER, {
        variables: { userId: session?.user?.id as string },
        skip: !session?.user?.id,
    });

    const cartId = cartData?.getCartByUser?.id;

    const [addCartItem] = useMutation(ADD_CART_ITEM, {
        refetchQueries: [
            { query: GET_CART_BY_USER, variables: { userId: session?.user?.id } },
        ],
    });

    if (loading) return <div>Loading book...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No book found</div>;

    return (
        <div className="bg-white">
            <Navbar session={session} />

            <div className="w-auto rounded-lg p-6 flex flex-col md:flex-row gap-6 mt-15 h-auto mx-20 border border-gray-200 mb-10">
                <div className="w-full md:w-2/3 justify-center ml-24">
                    <Image
                        src={data.book.thumbnail}
                        width={200}
                        height={200}
                        alt={data.book.title}
                        className="rounded-lg w-72 h-[400px]"
                    />

                    <div className="mt-6 flex gap-4">
                        <button
                            className="bg-[#DB4444] text-white font-bold py-2 px-6 rounded-md mt-4 w-fit cursor-pointer"
                            onClick={async () => {
                                if (!session?.user?.id) {
                                    alert("Bạn phải đăng nhập để thêm vào giỏ hàng");
                                    router.push("/page/LoginPage");
                                    return;
                                }
                                try {
                                    await addCartItem({
                                        variables: {
                                            cartId: cartId,
                                            userId: session?.user?.id,
                                            bookId: bookId,
                                            quantity: 1,
                                        },
                                    });

                                    alert("Thêm vào giỏ hàng thành công");
                                    router.push("/page/CartPage");
                                } catch (err) {
                                    console.error(err);
                                    alert("Thêm vào giỏ hàng thất bại!");
                                }
                            }}
                        >
                            Shop Now
                        </button>

                        <button
                            className="bg-black text-white font-bold py-2 px-6 rounded-md mt-4 w-fit cursor-pointer"
                            onClick={async () => {
                                if (!session?.user?.id) {
                                    alert("Bạn phải đăng nhập để thêm vào giỏ hàng");
                                    router.push("/page/LoginPage");
                                    return;
                                }
                                try {
                                    await addCartItem({
                                        variables: {
                                            cartId: cartId,
                                            userId: session?.user?.id,
                                            bookId: bookId,
                                            quantity: 1,
                                        },
                                    });

                                    alert("Thêm vào giỏ hàng thành công");
                                } catch (err) {
                                    console.error(err);
                                    alert("Thêm vào giỏ hàng thất bại!");
                                }
                            }}
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>

                <div className="md:w-7xl flex flex-col mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-[#2F70AF]">{data.book.title}</h1>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-xl font-semibold text-[#000000]">
                            ${data.book.price}.00
                        </p>
                    </div>

                    <h2 className="text-lg font-semibold text-[#FB635D] mt-4 text-[16px]">
                        Description :{" "}
                        <span className="text-[#173F5F] text-[13px]">
                            {data.book.description}
                        </span>
                    </h2>
                </div>
            </div>

            <div className="mx-12">
                <CommentSection bookId={bookId as string} session={session} />
            </div>

            <Footer />
        </div>
    );
}