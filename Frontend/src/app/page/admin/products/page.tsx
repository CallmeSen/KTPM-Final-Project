"use client";

import { GET_ALL_BOOKS } from "@/app/graphQL/queries";
import { Book } from "@/app/interfaces/Books.interface";
import AdminNavbar from "@/app/page/admin/components/admin-navbar";
import { AppSidebar } from "@/app/page/admin/components/Slider";
import { getRandomInventory } from "@/app/page/admin/functions/random-inventory";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";



type BooksResponse = {
    books: {
        data: Book[];
        total: number;
        page: number;
        limit: number;
    };
};

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const limit = 5;

    const { data, loading, error } = useQuery<BooksResponse>(GET_ALL_BOOKS, {
        variables: { page, limit },
        fetchPolicy: "cache-and-network",
    }); 

    if (loading && !data) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-600">Error: {error.message}</p>;
    }

    const books = data?.books.data ?? [];
    const total = data?.books.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex h-screen w-full">
            <div className="w-64">
                <AppSidebar />
            </div>

            <div className="w-full">
                <div className="h-14 border-b">
                    <AdminNavbar />
                </div>

                <div className="w-full p-6 overflow-auto bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Products</h1>
                        <button className="px-4 py-2 bg-green-700 text-white cursor-pointer">
                            Create Product
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl shadow bg-white">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                                    <th className="p-3">Thumbnail</th>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Inventory</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr
                                        key={book.id}
                                        className="border-b hover:bg-gray-50 text-sm"
                                    >
                                       
                                        <td className="p-3">
                                            <Image
                                                src={book.thumbnail || "/images/default.jpg"}
                                                alt={book.title}
                                                width={50}
                                                height={50}
                                                className="rounded-md object-cover"
                                            />
                                        </td>
                                        <td className="p-3">{book.title}</td>
                                        <td className="p-3">${book.price}</td>
                                        <td className="p-3">
                                            {getRandomInventory()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        
                        <span className="text-sm border-1 border-gray-300 p-2">
                            {page} / {totalPages}
                        </span>

                        <div className="flex gap-2">
                            {page > 1 && (
                                <button
                                    onClick={() => setPage((prev) => prev - 1)}
                                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
