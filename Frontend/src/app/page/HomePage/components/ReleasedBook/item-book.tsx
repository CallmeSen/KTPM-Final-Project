'use client'

import { PropsItemBooks } from "@/app/interfaces/Props-ItemBooks.interface"
import BookCard from "@/app/page/HomePage/components/ReleasedBook/book-card"
import { useState } from "react"

export default function ItemBooks({ books }: PropsItemBooks) {
    const slidesPerView = 4
    const [currentSlide, setCurrentSlide] = useState(0)

    const totalSlides = Math.ceil(books.length / slidesPerView)

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <div className="w-full ">
       
            <div className="overflow-x-hidden relative">
                
                <div
                    className="flex transition-transform duration-500 gap-6"
                    style={{
                        transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`,
                    }}
                >
                    {books.map((book) => (
                        <BookCard key={book.id} book = {book}/>
                    ))}

                </div>
            </div>

          
            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${currentSlide === index ? "bg-[#ED553B]" : "bg-gray-300"
                            }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    )
}
