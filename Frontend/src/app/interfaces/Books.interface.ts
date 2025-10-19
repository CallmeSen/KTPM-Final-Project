export interface Book {
  id: string;
  title: string;
  thumbnail: string;
  authors: string;
  average_rating: number;
  published_year: number;
  description: string;
  num_pages: number;
  ratings_count: number;
  price: number;
  id_stripe: string;
  inventories?: any[]; 
}


export interface GetBookData {
  book: Book;
}

export interface BookPreview {
  id: string;
  title: string;
  thumbnail: string;
}

export interface GetTopRatedBooksData {
  getTopRatedBooks: Book[];
}

export interface BookCardProps {
    book: Book;
}