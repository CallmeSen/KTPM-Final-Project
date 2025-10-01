"use client";
import LibraryNavbar from "@/app/page/BookLibrary/components/LibraryNavbar/page";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    GET_BOOKS_BY_CATEGORY,
    SEARCH_BOOKS_BY_TITLE,
} from "@/app/graphQL/queries";
import { Book } from "@/app/interfaces/Books.interface";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { BooksByCategoryData } from "@/app/interfaces/Props-ItemBooks.interface";
import BookCard from "@/app/page/BookLibrary/components/BookCard";
import { Session } from "@/app/interfaces/session.interface";
import { getSession } from "@/lib/session";

export default function Library() {

    const [session, setSession] = useState<Session | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [category, setCategory] = useState("History");

    const [page, setPage] = useState(1);

    const [limit] = useState(12);

    const [books, setBooks] = useState<Book[]>([]);

    const [totalPages, setTotalPages] = useState(1);

    const fetchSession = async () => {
        const session = await getSession();
        setSession(session);
    };

    useEffect(() => {
        fetchSession();
    }, []);

    const { data, loading, error } = useQuery<BooksByCategoryData>(
        searchTerm ? SEARCH_BOOKS_BY_TITLE : GET_BOOKS_BY_CATEGORY,
        {
            variables: searchTerm
                ? { searchTerm }
                : { categoryName: category, page, limit },
        }
    );


    useEffect(() => {
        if (searchTerm) {
            setBooks((data as any)?.searchBooksByTitle ?? []);
            setTotalPages(1);
        } else {
            setBooks(data?.booksByCategory?.data ?? []);
            setTotalPages(data?.booksByCategory?.totalPages ?? 1);
        }
    }, [data, searchTerm]);

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error)
        return (
            <p className="text-center mt-10 text-red-500">Error: {error.message}</p>
        );

    return (
        <div className="bg-white">
            <LibraryNavbar
                session={session}
                onSearch={(term) => {
                    setSearchTerm(term);
                    setPage(1);
                }}
            />

            <div className="w-full p-12">

                <div className="w-full bg-white  p-5 h-1/3  flex items-center">
                    <h3 className="text-lg font-semibold text-customBlue mb-4 text-[#294563] mr-10">
                        Categories
                    </h3>
                    <ul className="space-y-4 flex">
                        {[
                            "History",
                            "Fiction",
                            "Science",
                            "Juvenile Fiction",
                            "Poetry",
                            "Drama",
                        ].map((cat) => (
                            <li
                                key={cat}
                                className={`p-2 rounded-lg cursor-pointer ${category === cat ? "bg-customBlue text-white" : "text-[#294563]"
                                    }`}
                                onClick={() => {
                                    setCategory(cat);
                                    setSearchTerm("");
                                    setPage(1);
                                }}
                            >
                                <span
                                    className={`hover:text-customBlue ${category === cat ? "text-[#FB635D]" : "text-customergray"
                                        }`}
                                >
                                    {cat}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 ml-34 mr-32 border-2">
                    <h2 className="text-xl font-bold mb-4 text-[#294563]">Kho sách</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </div>


            {!searchTerm && totalPages > 1 && (
                <Pagination className="mt-2 ">
                    <PaginationContent className="gap-3 mb-4">
                        <PaginationItem>
                            <PaginationPrevious
                                className="bg-blue-950 text-white hover:bg-customBlue border border-gray-300 w-[90px] h-8 p-2"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) setPage((prev) => prev - 1);
                                } } size={300}                            />
                        </PaginationItem>

                        {Array.from({ length: 4 })
                            .map((_, i) => page + i)
                            .filter((p) => p <= totalPages)
                            .map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(p);
                                        } }
                                        className={`border border-gray-300 ${page === p
                                            ? "bg-black text-white"
                                            : "bg-white text-black hover:bg-customBlue "}`} size={undefined}                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                        <PaginationItem>
                            <PaginationNext
                                className="bg-blue-950 hover:bg-customBlue text-white border border-gray-300 w-[90px] h-8 p-2"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages) setPage((prev) => prev + 1);
                                } } size={undefined}                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
