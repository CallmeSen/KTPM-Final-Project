"use client"

import Link from "next/link"
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa"
import Image from "next/image";

export default function CartNavbar() {
    const [session, setSession] = useState(false);
    return (
        <nav className="w-full bg-white shadow-md p-4 flex items-center justify-between">

            <Link
                href="/page/HomePage"
                className="flex items-center gap-2 text-black hover:text-blue-800"
            >
                <FaArrowLeft /> <span>Trang chính</span>
            </Link>


            <h1 className="text-2xl font-bold text-[#FB635D]">GIỎ HÀNG</h1>



            <div className="flex gap-5 ml-15">
                <Image
                    src="/avatar.svg"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer"
                />

            </div>
        </nav>
    )
}
