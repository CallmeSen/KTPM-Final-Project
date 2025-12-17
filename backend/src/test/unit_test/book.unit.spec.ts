
import { describe, it, expect } from '@jest/globals';

// ==========================================
// 1. MOCK INTERFACES & PLACEHOLDER FUNCTIONS
// ==========================================

interface Book {
    id: string;
    title: string;
    rating: number;
    year: number;
}

// Placeholder for GetTopRatedBooks Logic
const getTopRatedBooks = (books: Book[] | null, limit: number): Book[] => {
    if (!books) return [];
    
    // Sort by Rating Desc, then by Year Desc (Tie-break)
    const sorted = [...books].sort((a, b) => {
        if (b.rating !== a.rating) {
            return b.rating - a.rating;
        }
        return b.year - a.year; // Newer books first
    });

    return sorted.slice(0, limit);
};

// Placeholder for Partition Logic
const partition = (list: any[], chunkSize: number): any[][] => {
    if (chunkSize <= 0) throw new Error('ArgumentException: Chunk size must be greater than 0');
    if (!list) return [];
    
    const result: any[][] = [];
    for (let i = 0; i < list.length; i += chunkSize) {
        result.push(list.slice(i, i + chunkSize));
    }
    return result;
};

// ==========================================
// 2. UNIT TEST SUITE
// ==========================================

describe('Book Module - Unit Tests', () => {

    // ---------------------------------------------------------
    // GetTopRatedBooks Tests
    // ---------------------------------------------------------
    describe('GetTopRatedBooks Logic', () => {
        
        // [Book-26] UIT_Book_GetTopRated_DescOrder
        it('should sort books by rating in descending order', () => {
            const input: Book[] = [
                { id: '1', title: 'A', rating: 3.5, year: 2020 },
                { id: '2', title: 'B', rating: 5.0, year: 2020 },
                { id: '3', title: 'C', rating: 4.2, year: 2020 }
            ];
            
            const result = getTopRatedBooks(input, 3);
            
            expect(result[0].rating).toBe(5.0); // B
            expect(result[1].rating).toBe(4.2); // C
            expect(result[2].rating).toBe(3.5); // A
        });

        // [Book-27] UIT_Book_GetTopRated_TieBreak
        it('should use secondary criteria (Year) when ratings are equal', () => {
            const input: Book[] = [
                { id: '1', title: 'Old', rating: 4.5, year: 2022 },
                { id: '2', title: 'New', rating: 4.5, year: 2023 }
            ];

            const result = getTopRatedBooks(input, 2);

            expect(result[0].title).toBe('New'); // 2023
            expect(result[1].title).toBe('Old'); // 2022
        });

        // [Book-28] UIT_Book_GetTopRated_LimitLoop
        it('should return exactly N items when limit is set', () => {
            const input = Array.from({ length: 50 }, (_, i) => ({ 
                id: `${i}`, title: `Book ${i}`, rating: 4.0, year: 2020 
            }));

            const result = getTopRatedBooks(input, 10);

            expect(result.length).toBe(10);
        });

        // [Book-29] UIT_Book_GetTopRated_EmptyPath
        it('should return empty array when input is null or empty', () => {
            expect(getTopRatedBooks([], 5)).toEqual([]);
            expect(getTopRatedBooks(null, 5)).toEqual([]);
        });
    });

    // ---------------------------------------------------------
    // Partition Tests
    // ---------------------------------------------------------
    describe('Partition Logic', () => {

        // [Book-30] UT_BOOK_Partition_Even
        it('should divide list evenly when size is divisible', () => {
            const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // 10 items
            const result = partition(list, 2);

            expect(result.length).toBe(5);
            expect(result[0].length).toBe(2);
            expect(result[4].length).toBe(2);
        });

        // [Book-31] UT_BOOK_Partition_Remainder
        it('should handle remainder correctly', () => {
            const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // 10 items
            const result = partition(list, 3);

            // 10 / 3 = 3 chunks of 3, plus 1 chunk of 1
            expect(result.length).toBe(4);
            expect(result[0].length).toBe(3);
            expect(result[3].length).toBe(1);
        });

        // [Book-32] UT_BOOK_Partition_Empty
        it('should return empty list when input is empty', () => {
            const result = partition([], 5);
            expect(result).toEqual([]);
        });

        // [Book-33] UT_BOOK_Partition_Invalid
        it('should throw exception for invalid chunk size', () => {
            const list = [1, 2, 3];
            expect(() => partition(list, 0)).toThrow('ArgumentException');
            expect(() => partition(list, -1)).toThrow('ArgumentException');
        });
    });

});
