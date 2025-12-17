"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, MessageCircle, ShoppingCart } from "lucide-react";
import { FaRobot, FaSearch } from "react-icons/fa";
import { Session } from "@/lib/type";
import Image from "next/image";
import { useState } from "react";

export default function LibraryNavbar({
    session,
    onSearch,
}: {
    session: Session | null;
    onSearch: (value: string) => void;
}) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    return (
        <nav className="w-full bg-[#2F70AF] shadow-md p-4 flex items-center justify-between">

            <div className="flex items-center gap-4">
                <button
                    onClick={() =>
                        router.push(process.env.HomePage_URL || "/page/HomePage")
                    }
                    className="p-4"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700 rounded-full bg-white cursor-pointer" />
                </button>
                <span className="text-lg font-semibold text-white">BookStore</span>
            </div>

           
            <form
                onSubmit={handleSearch}
                className="flex-1 mx-6 relative flex items-center"
            >
                <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 pr-10 rounded-lg bg-white outline-none border-none text-black"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                    <FaSearch className="text-[#000000]" />
                </button>
            </form>

         
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-300 ">
                    <Bell className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    className="p-2 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-300"
                    onClick={() =>
                        router.push(process.env.HomePage_URL || "/page/HomePage")
                    }
                >
                    <FaRobot size={22}  className="w-5 h-5 text-gray-600" />
                </button>
                <button
                    className="p-2 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-300"
                    onClick={() =>
                        router.push(process.env.HomePage_URL || "/page/CartPage")
                    }
                >
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                </button>

                {session ? (
                    <Image
                        src="/avatar.svg"
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full cursor-pointer"
                    />
                ) : (
                    <div className="flex gap-3">
                        <Link href="/page/LoginPage" className="text-white hover font-medium">
                            Đăng nhập
                        </Link>
                        <Link
                            href="/page/RegisterPage"
                            className="text-white hover font-medium"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
