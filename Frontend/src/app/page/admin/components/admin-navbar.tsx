"use client";

import { Link, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function AdminNavbar() {

    const categories = [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Products", href: "/admin/products" },
        { name: "Orders", href: "/admin/orders" },
        { name: "Settings", href: "/admin/settings" },
    ];

    return (
        <nav className="w-full h-14 bg-white  flex items-center justify-between px-14">


            <div className="relative w-1/2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-black " />
                <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 w-full text-black bg-gray-100 border-gray-200 hover:border-blue-500"
                />
            </div>

            <Image
                src="/avatar.svg"
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
            />
        </nav>

    );
}
