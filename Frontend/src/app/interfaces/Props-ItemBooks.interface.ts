import { Book } from "@/app/interfaces/Books.interface";



export interface PropsItemBooks {
    books: Book[];
}

export interface BooksByCategoryData {
  booksByCategory: {
    data: Book[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}
