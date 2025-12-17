'use client'

import { useState } from "react";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { Book } from "@/app/interfaces/Books.interface";



export default function BookCard({ book }: { book: Book }) {
    const [imgError, setImgError] = useState(false)
    
    if (!book.thumbnail || imgError) return null

    const router = useRouter();

    const handleClick = () => {
        router.push(`/page/DetailBookPage?id=${book.id}`);
    };

    return (
        <div className="flex-shrink-0 w-[calc(25%-1.5rem)] bg-white rounded-lg border shadow-lg flex flex-col items-center p-3 h-[300px] ml-1">
            <div className="w-[170px] h-[220px] mb-4 overflow-hidden rounded-md">
                <Image
                    src={book.thumbnail}
                    alt={book.title}
                    width={150}
                    height={150}
                    className="w-full h-full "
                    onError={() => setImgError(true)}
                />
            </div>
            <button className=" text-white px-4 py-2 rounded bg-[#FB635D] hover:bg-[#173F5F] transition-colors duration-300 cursor-pointer" onClick={handleClick}>
                Xem chi tiết
            </button>
        </div>
    )
}