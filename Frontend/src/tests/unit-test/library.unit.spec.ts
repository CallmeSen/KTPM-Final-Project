/**
 * Unit Test for Library Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Book {
  id: number;
  title: string;
  categoryId: number;
  price: number;
  thumbnail: string | null;
  author?: string;
  createdAt: Date;
}

interface Category {
  id: number;
  name: string;
  bookCount: number;
}

interface SortOption {
  field: 'price' | 'title' | 'createdAt';
  order: 'asc' | 'desc';
}

// ============================================================================
// MOCK STATE & DEPENDENCIES
// ============================================================================

let currentBooks: Book[] = [];
let currentCategory: number | null = null;
let currentPage = 1;
let hasMoreData = true;
let isLoading = false;

const mockApi = {
  getBooksByCategory: jest.fn(),
  searchBooks: jest.fn(),
  loadMoreBooks: jest.fn()
};

const mockRouter = {
  push: jest.fn(),
  back: jest.fn()
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price with thousand separators
 */
const formatPrice = (price: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return `${price.toLocaleString('vi-VN')} đ`;
  } else if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  }
  return price.toString();
};

/**
 * Truncate long text with ellipsis
 */
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Get thumbnail URL with fallback
 */
const getThumbnailUrl = (thumbnail: string | null): string => {
  if (!thumbnail) {
    return '/images/placeholder-book.png';
  }
  return thumbnail;
};

/**
 * Sort books by field
 */
const sortBooks = (books: Book[], option: SortOption): Book[] => {
  const sorted = [...books];
  
  sorted.sort((a, b) => {
    let compareA: any;
    let compareB: any;

    switch (option.field) {
      case 'price':
        compareA = a.price;
        compareB = b.price;
        break;
      case 'title':
        compareA = a.title.toLowerCase();
        compareB = b.title.toLowerCase();
        break;
      case 'createdAt':
        compareA = a.createdAt.getTime();
        compareB = b.createdAt.getTime();
        break;
      default:
        return 0;
    }

    if (option.order === 'asc') {
      return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
    } else {
      return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
    }
  });

  return sorted;
};

// ============================================================================
// FUNCTION: handleCategorySwitch (Placeholder implementation)
// ============================================================================

const handleCategorySwitch = async (newCategoryId: number): Promise<void> => {
  // Clear previous category data
  currentBooks = [];
  currentCategory = newCategoryId;
  currentPage = 1;
  hasMoreData = true;

  // Load new category books
  try {
    const response = await mockApi.getBooksByCategory(newCategoryId);
    currentBooks = response.data || [];
  } catch (error) {
    currentBooks = [];
  }
};

// ============================================================================
// FUNCTION: handleLazyLoad (Placeholder implementation)
// ============================================================================

const handleLazyLoad = async (): Promise<{ loaded: number; hasMore: boolean }> => {
  if (isLoading || !hasMoreData) {
    return { loaded: 0, hasMore: false };
  }

  isLoading = true;

  try {
    const response = await mockApi.loadMoreBooks(currentPage + 1);
    
    if (response.data && response.data.length > 0) {
      // Append new books to existing list
      currentBooks = [...currentBooks, ...response.data];
      currentPage += 1;
      hasMoreData = response.data.length >= 10; // Assuming 10 items per page
      
      isLoading = false;
      return { loaded: response.data.length, hasMore: hasMoreData };
    } else {
      // No more data
      hasMoreData = false;
      isLoading = false;
      return { loaded: 0, hasMore: false };
    }
  } catch (error) {
    isLoading = false;
    return { loaded: 0, hasMore: false };
  }
};

// ============================================================================
// FUNCTION: handleNavigation (Placeholder implementation)
// ============================================================================

let navigationClickCount = 0;
let navigationTimer: NodeJS.Timeout | null = null;

const handleNavigation = (bookId: number, event?: { ctrlKey?: boolean; metaKey?: boolean }): void => {
  // Prevent double navigation
  navigationClickCount++;
  
  if (navigationClickCount > 1) {
    return; // Already navigating
  }

  if (navigationTimer) {
    clearTimeout(navigationTimer);
  }

  navigationTimer = setTimeout(() => {
    navigationClickCount = 0;
  }, 300);

  // Check if Ctrl/Cmd key is pressed (open in new tab)
  if (event?.ctrlKey || event?.metaKey) {
    // Open in new tab (window.open)
    window.open(`/books/${bookId}`, '_blank');
  } else {
    // Navigate in same tab
    mockRouter.push(`/books/${bookId}`);
  }
};

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Library Module - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset state
    currentBooks = [];
    currentCategory = null;
    currentPage = 1;
    hasMoreData = true;
    isLoading = false;
    navigationClickCount = 0;
    
    if (navigationTimer) {
      clearTimeout(navigationTimer);
      navigationTimer = null;
    }
  });

  // ==========================================================================
  // TEST GROUP: CATEGORY SWITCHING (State Management)
  // ==========================================================================

  describe('Function: handleCategorySwitch', () => {

    it('[FE_LIBRARY-5] FE_LIB_GetByCat_Switching - Chuyển đổi giữa các danh mục', async () => {
      // Arrange: Đang xem danh mục A (10 sách)
      const categoryABooks: Book[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Book A${i + 1}`,
        categoryId: 1,
        price: 100000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));

      const categoryBBooks: Book[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 100,
        title: `Book B${i + 1}`,
        categoryId: 2,
        price: 200000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));

      // Mock API responses
      mockApi.getBooksByCategory
        .mockResolvedValueOnce({ data: categoryABooks })
        .mockResolvedValueOnce({ data: categoryBBooks });

      // Set initial state (Category A)
      await handleCategorySwitch(1);
      expect(currentBooks).toHaveLength(10);

      // Act: Click sang danh mục B
      await handleCategorySwitch(2);

      // Assert
      expect(currentBooks).toHaveLength(5); // Hiển thị đúng 5 sách của B
      expect(currentBooks[0].title).toBe('Book B1'); // Danh sách cũ (A) bị xóa
      expect(currentCategory).toBe(2);
      
      // Không bị trộn lẫn A và B
      const hasCategoryA = currentBooks.some(book => book.categoryId === 1);
      expect(hasCategoryA).toBe(false);
    });
  });

  // ==========================================================================
  // TEST GROUP: LAZY LOAD
  // ==========================================================================

  describe('Function: handleLazyLoad', () => {

    it('[FE_LIBRARY-12] FE_LIB_List_LazyLoad_Init - Lần đầu tải', async () => {
      // Arrange: Danh mục có 50 sách, tải trước 10-20 sách
      const initialBooks: Book[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        categoryId: 1,
        price: 100000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));

      mockApi.getBooksByCategory.mockResolvedValueOnce({ data: initialBooks });

      // Act: Vào trang thư viện
      await handleCategorySwitch(1);

      // Assert
      expect(currentBooks).toHaveLength(10); // Chỉ tải 10 sách đầu
      expect(mockApi.getBooksByCategory).toHaveBeenCalledTimes(1);
    });

    it('[FE_LIBRARY-13] FE_LIB_List_LazyLoad_Scroll - Khi cuộn trang', async () => {
      // Arrange: Trang 1 đã load 10 sách
      currentBooks = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        categoryId: 1,
        price: 100000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));
      currentPage = 1;

      const page2Books: Book[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 11,
        title: `Book ${i + 11}`,
        categoryId: 1,
        price: 100000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));

      mockApi.loadMoreBooks.mockResolvedValueOnce({ data: page2Books });

      // Act: Cuộn xuống cuối
      const result = await handleLazyLoad();

      // Assert
      expect(result.loaded).toBe(10); // API trang 2 được gọi
      expect(currentBooks).toHaveLength(20); // Sách mới được nối đuôi (append)
      expect(currentBooks[10].title).toBe('Book 11');
      expect(currentPage).toBe(2);
    });

    it('[FE_LIBRARY-14] FE_LIB_List_LazyLoad_End - Hết dữ liệu', async () => {
      // Arrange: Đã load hết sách, API trả về mảng rỗng
      currentBooks = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        categoryId: 1,
        price: 100000,
        thumbnail: 'img.jpg',
        createdAt: new Date()
      }));
      currentPage = 5;

      mockApi.loadMoreBooks.mockResolvedValueOnce({ data: [] });

      // Act: Cuộn đến cuối
      const result = await handleLazyLoad();

      // Assert
      expect(result.hasMore).toBe(false); // Không còn dữ liệu
      expect(result.loaded).toBe(0);
      expect(hasMoreData).toBe(false); // Không gọi thêm API dư thừa
      expect(mockApi.loadMoreBooks).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // TEST GROUP: UI FORMATTING
  // ==========================================================================

  describe('Helper Functions: UI Formatting', () => {

    it('[FE_LIBRARY-17] FE_LIB_BookItem_Thumbnail - Kiểm tra ảnh bìa sách', () => {
      // Test Case 1: Ảnh hợp lệ
      const validThumbnail = getThumbnailUrl('https://example.com/book.jpg');
      expect(validThumbnail).toBe('https://example.com/book.jpg');

      // Test Case 2: Ảnh null (lỗi 404)
      const brokenThumbnail = getThumbnailUrl(null);
      expect(brokenThumbnail).toBe('/images/placeholder-book.png'); // Placeholder
    });

    it('[FE_LIBRARY-18] FE_LIB_BookItem_TitleTruncate - Cắt ngắn tên sách quá dài', () => {
      // Arrange: Tên dài 100 ký tự
      const longTitle = 'A'.repeat(100);

      // Act: Truncate
      const truncated = truncateText(longTitle, 50);

      // Assert
      expect(truncated.length).toBe(53); // 50 + '...' (3 chars)
      expect(truncated).toContain('...'); // Có dấu ...
      expect(truncated.startsWith('AAA')).toBe(true);
    });

    it('[FE_LIBRARY-18-EXTRA] Should not truncate if within limit', () => {
      // Arrange: Tên ngắn
      const shortTitle = 'Clean Code';

      // Act
      const result = truncateText(shortTitle, 50);

      // Assert
      expect(result).toBe('Clean Code'); // Không cắt
      expect(result).not.toContain('...');
    });

    it('[FE_LIBRARY-19] FE_LIB_BookItem_PriceFormat - Định dạng giá tiền', () => {
      // Test Case 1: VND format
      const priceVND = formatPrice(100000, 'VND');
      expect(priceVND).toBe('100.000 đ'); // Có phân cách hàng nghìn

      // Test Case 2: USD format
      const priceUSD = formatPrice(100000.5, 'USD');
      expect(priceUSD).toBe('$100000.50'); // Decimal format
    });
  });

  // ==========================================================================
  // TEST GROUP: SORTING
  // ==========================================================================

  describe('Function: sortBooks', () => {

    const mockBooks: Book[] = [
      { id: 1, title: 'Zebra Book', categoryId: 1, price: 300000, thumbnail: null, createdAt: new Date('2023-01-01') },
      { id: 2, title: 'Apple Book', categoryId: 1, price: 100000, thumbnail: null, createdAt: new Date('2023-03-01') },
      { id: 3, title: 'Banana Book', categoryId: 1, price: 200000, thumbnail: null, createdAt: new Date('2023-02-01') }
    ];

    it('[FE_LIBRARY-20] FE_LIB_Sort_PriceAsc - Sắp xếp giá tăng dần', () => {
      // Act: Sort giá thấp -> cao
      const sorted = sortBooks(mockBooks, { field: 'price', order: 'asc' });

      // Assert
      expect(sorted[0].price).toBe(100000); // Giá thấp nhất lên đầu
      expect(sorted[1].price).toBe(200000);
      expect(sorted[2].price).toBe(300000);
      
      // Verify Price[i] <= Price[i+1]
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
      }
    });

    it('[FE_LIBRARY-21] FE_LIB_Sort_PriceDesc - Sắp xếp giá giảm dần', () => {
      // Act: Sort giá cao -> thấp
      const sorted = sortBooks(mockBooks, { field: 'price', order: 'desc' });

      // Assert
      expect(sorted[0].price).toBe(300000); // Giá cao nhất lên đầu
      expect(sorted[1].price).toBe(200000);
      expect(sorted[2].price).toBe(100000);
    });

    it('[FE_LIBRARY-22] FE_LIB_Sort_NameAsc - Sắp xếp tên A-Z', () => {
      // Act: Sort tên A->Z
      const sorted = sortBooks(mockBooks, { field: 'title', order: 'asc' });

      // Assert
      expect(sorted[0].title).toBe('Apple Book'); // A lên đầu
      expect(sorted[1].title).toBe('Banana Book');
      expect(sorted[2].title).toBe('Zebra Book'); // Z xuống cuối
    });

    it('[FE_LIBRARY-23] FE_LIB_Sort_Default - Sắp xếp mặc định', () => {
      // Act: Sort theo ngày tạo mới nhất (Newest first)
      const sorted = sortBooks(mockBooks, { field: 'createdAt', order: 'desc' });

      // Assert
      expect(sorted[0].createdAt.getTime()).toBe(new Date('2023-03-01').getTime()); // Mới nhất
      expect(sorted[2].createdAt.getTime()).toBe(new Date('2023-01-01').getTime()); // Cũ nhất
    });
  });

  // ==========================================================================
  // TEST GROUP: NAVIGATION
  // ==========================================================================

  describe('Function: handleNavigation', () => {

    beforeEach(() => {
      // Mock window.open
      global.window.open = jest.fn();
    });

    it('[FE_LIBRARY-24] FE_LIB_Nav_Detail - Điều hướng sang trang chi tiết', () => {
      // Act: Click vào sách
      handleNavigation(123);

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith('/books/123'); // URL đổi sang /books/:id
    });

    it('[FE_LIBRARY-25] FE_LIB_Nav_NewTab - Mở trong tab mới', () => {
      // Act: Ctrl + Click
      handleNavigation(123, { ctrlKey: true });

      // Assert
      expect(window.open).toHaveBeenCalledWith('/books/123', '_blank'); // Mở tab mới
      expect(mockRouter.push).not.toHaveBeenCalled(); // Không navigate trong tab hiện tại
    });

    it('[FE_LIBRARY-27] FE_LIB_Nav_Double - Double Click nhanh (Stress Test)', () => {
      // Act: Click liên tiếp 3 lần
      handleNavigation(123);
      handleNavigation(123);
      handleNavigation(123);

      // Assert
      expect(mockRouter.push).toHaveBeenCalledTimes(1); // Chỉ chuyển trang 1 lần
    });

    it('[FE_LIBRARY-27-EXTRA] Should reset counter after timeout', async () => {
      // Act: Click first time
      handleNavigation(123);
      expect(mockRouter.push).toHaveBeenCalledTimes(1);

      // Wait for timeout (300ms)
      await new Promise(resolve => setTimeout(resolve, 350));

      // Click again after timeout
      handleNavigation(456);

      // Assert: Second navigation should work
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
      expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/books/456');
    });
  });
});
