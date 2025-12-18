"use client";

import { BookCardProps } from "@/app/interfaces/Books.interface";
import Image from "next/image";
import { useRouter } from "next/navigation";




export default function BookCard({ book }: BookCardProps) {

    const router = useRouter();

    const handleClick = () => {
        router.push(`/page/DetailBookPage?id=${book.id}`);
    };

    return (
        <div className="bg-white border rounded-lg shadow hover:shadow-lg transition flex flex-col" onClick={handleClick} style={{ cursor: 'pointer' }}>

            <div className="relative w-full pt-[120%]">

                <Image
                    src={book.thumbnail ?? "/placeholder-book.jpg"}
                    alt={book.title}
                    fill
                    className=" rounded-t-lg"
                />
            </div>

            <div className="flex flex-col flex-1 p-3">
                <h3 className="text-sm font-semibold text-[#294563] line-clamp-2 min-h-[2.5rem]">
                    {book.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.authors}</p>
                <p className="text-xs text-gray-400">{book.published_year}</p>
            </div>
        </div>
    );
}
