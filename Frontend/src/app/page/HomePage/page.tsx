'use client'
import BookSellBanner from "@/app/page/HomePage/components/BookSellBanner/page";
import { CarouselDApiDemo } from "@/app/page/HomePage/components/Carousel/carousel"
import { GetFreeBooks } from "@/app/page/HomePage/components/GetFreeBook/page";
import Navbar from "@/app/page/HomePage/components/NavBar/page"
import { NewReleaseBooks } from "@/app/page/HomePage/components/ReleasedBook/page";
import Footer from "@/Shared/Footer/page";
import { GET_TOP_RATED_BOOKS } from "@/app/graphQL/queries";
import { useQuery } from "@apollo/client/react";
import { PropsItemBooks } from "@/app/interfaces/Props-ItemBooks.interface";
import { GetTopRatedBooksData } from "@/app/interfaces/Books.interface";
import { getSession } from "@/lib/session";
import { useEffect, useState } from "react";
import { Session } from "@/app/interfaces/session.interface";
import CenterLoading from "@/Shared/Loading/page";
import ErrorWidget from "@/Shared/Error/page";


export default function Homepage() {

    const [session, setSession] = useState<Session | null>(null);

    const [loading, setLoading] = useState(true);

   

    useEffect(() => {
        (async () => {
            const session = await getSession();
            setSession(session);
            setLoading(false);
        })();
    }, []);



    const { data, error } = useQuery<GetTopRatedBooksData>(GET_TOP_RATED_BOOKS, {
        variables: { limit: 10 },
    });


    const booksData: PropsItemBooks = {
        books: data?.getTopRatedBooks
            .filter(b => b.thumbnail)
            .map(b => ({
                id: b.id,
                title: b.title,
                thumbnail: b.thumbnail,
                authors: b.authors,
                average_rating: b.average_rating,
                published_year: b.published_year,
                description: b.description,
                num_pages: b.num_pages,
                ratings_count: b.ratings_count,
                price: b.price,
                id_stripe: b.id_stripe,
            })) || []
    };

    if (loading) return CenterLoading({ message: "Đang tải..." });

    if (error) return ErrorWidget({ message: error.message });


    return (
        <div className="bg-white">
            <Navbar session={session} />
            <CarouselDApiDemo />
            <NewReleaseBooks books={booksData.books} />
            <GetFreeBooks />
            <BookSellBanner />
            <Footer />
        </div>
    )
}
