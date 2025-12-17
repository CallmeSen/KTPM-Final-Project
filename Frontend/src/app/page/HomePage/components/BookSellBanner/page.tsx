'use client'
import Image from "next/image"

export default function BookSellBanner() {
    return (
        <div className="bg-[#FCEBEA] flex items-center justify-between px-10 py-6">

            <div className="w-1/2 space-y-4">
                <h2 className="text-[#173F5F] text-4xl font-bold">
                    All Books 50% Off – Don’t Miss This Amazing Deal!
                </h2>
                <p className="text-gray-600 text-lg">
                    Explore over <span className="font-bold">50,000+</span> titles across genres: fiction,
                    non-fiction, self-development, business, and children’s books.
                </p>
            </div>

            <div className="w-1/2 flex justify-center">
                <Image
                    src="/assets/Unsplash.png"
                    alt="Book Sale Banner"
                    width={400}
                    height={300}
                />
            </div>
        </div>
    )
}
