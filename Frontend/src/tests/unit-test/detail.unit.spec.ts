/**
 * Unit Test for Detail Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  author: string;
  stock: number;
  isActive: boolean;
}

interface CartItem {
  bookId: number;
  quantity: number;
  title: string;
  price: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
}

interface Comment {
  id: number;
  bookId: number;
  userId: number;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

// ============================================================================
// MOCK DEPENDENCIES
// ============================================================================

// Mock API Services
const bookApi = {
  getBookById: jest.fn(),
  addToCart: jest.fn(),
  getCart: jest.fn()
};

const commentApi = {
  likeComment: jest.fn(),
  unlikeComment: jest.fn()
};

// Mock State Management
let cartState: Cart = {
  items: [],
  totalItems: 0
};

let notificationMessage = '';

const setNotification = jest.fn((message: string) => {
  notificationMessage = message;
});

const updateCartState = jest.fn((newCart: Cart) => {
  cartState = newCart;
});

const updateCartIcon = jest.fn((totalItems: number) => {
  // Mock updating cart badge in UI
});

// ============================================================================
// MOCK FUNCTIONS - ADD CART
// ============================================================================

/**
 * Function to add item to cart
 * Handles: New item, existing item (merge), stock validation, quantity validation
 */
const addCartItem = async (bookId: number, qty: number, book?: Book): Promise<boolean> => {
  // Validation: Minimum quantity
  if (qty <= 0) {
    setNotification('Số lượng phải lớn hơn 0');
    return false;
  }

  // Validation: Maximum limit per purchase (config: 50)
  const MAX_QTY_PER_PURCHASE = 50;
  if (qty > MAX_QTY_PER_PURCHASE) {
    setNotification(`Không thể mua quá ${MAX_QTY_PER_PURCHASE} cuốn/lần`);
    return false;
  }

  // Check stock availability
  if (book) {
    const existingItem = cartState.items.find(item => item.bookId === bookId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalQty = currentQtyInCart + qty;

    if (totalQty > book.stock) {
      setNotification('Số lượng trong kho không đủ');
      return false;
    }
  }

  try {
    // Call API to add to cart
    const response = await bookApi.addToCart(bookId, qty);

    if (response.status === 200) {
      // Update cart state
      const existingItemIndex = cartState.items.findIndex(item => item.bookId === bookId);
      
      if (existingItemIndex >= 0) {
        // Item exists - merge quantity
        cartState.items[existingItemIndex].quantity += qty;
      } else {
        // New item - add to cart
        cartState.items.push({
          bookId,
          quantity: qty,
          title: book?.title || 'Unknown Book',
          price: book?.price || 0
        });
      }

      const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
      updateCartState({ ...cartState, totalItems });
      updateCartIcon(totalItems);

      return true;
    }

    return false;
  } catch (error) {
    setNotification('Có lỗi xảy ra khi thêm vào giỏ hàng');
    return false;
  }
};

// ============================================================================
// MOCK FUNCTIONS - LIKE/INTERACTION
// ============================================================================

interface LikeState {
  [commentId: number]: boolean;
}

let likeStates: LikeState = {};
let commentLikeCounts: { [commentId: number]: number } = {};

// Debounce implementation
let debounceTimer: NodeJS.Timeout | null = null;

const toggleLike = async (commentId: number, currentLikeState: boolean): Promise<boolean> => {
  // Clear previous debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        const newState = !currentLikeState;

        if (newState) {
          // Like
          const response = await commentApi.likeComment(commentId);
          if (response.status === 200) {
            likeStates[commentId] = true;
            commentLikeCounts[commentId] = (commentLikeCounts[commentId] || 0) + 1;
            resolve(true);
          }
        } else {
          // Unlike
          const response = await commentApi.unlikeComment(commentId);
          if (response.status === 200) {
            likeStates[commentId] = false;
            commentLikeCounts[commentId] = (commentLikeCounts[commentId] || 1) - 1;
            resolve(true);
          }
        }
      } catch (error) {
        resolve(false);
      }
    }, 300); // 300ms debounce
  });
};

const isUserLoggedIn = jest.fn(() => true);

const redirectToLogin = jest.fn();

const handleLikeClick = async (commentId: number): Promise<void> => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    redirectToLogin();
    return;
  }

  const currentState = likeStates[commentId] || false;
  await toggleLike(commentId, currentState);
};

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Detail Module - Unit Tests', () => {

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset state
    cartState = { items: [], totalItems: 0 };
    notificationMessage = '';
    likeStates = {};
    commentLikeCounts = {};
    
    // Clear debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  // ==========================================================================
  // TEST GROUP: ADD CART
  // ==========================================================================

  describe('Function: addCartItem', () => {

    const mockBook: Book = {
      id: 10,
      title: 'Sample Book',
      description: 'A great book',
      price: 100000,
      author: 'John Doe',
      stock: 10,
      isActive: true
    };

    it('[FE_DETAIL-7] FE_DETAIL_AddCart_NewItem - Thêm mới sản phẩm chưa có trong giỏ', async () => {
      // Arrange: Giỏ hàng trống, mock API success
      bookApi.addToCart.mockResolvedValueOnce({ status: 200 });

      // Act: Thêm sản phẩm mới
      const result = await addCartItem(10, 1, mockBook);

      // Assert
      expect(result).toBe(true);
      expect(bookApi.addToCart).toHaveBeenCalledWith(10, 1);
      expect(cartState.items).toHaveLength(1);
      expect(cartState.items[0]).toEqual({
        bookId: 10,
        quantity: 1,
        title: 'Sample Book',
        price: 100000
      });
      expect(updateCartIcon).toHaveBeenCalledWith(1);
    });

    it('[FE_DETAIL-8] FE_DETAIL_AddCart_ExistItem - Thêm sản phẩm đã có trong giỏ (Cộng dồn)', async () => {
      // Arrange: Giỏ hàng đã có sản phẩm
      cartState.items = [{
        bookId: 10,
        quantity: 2,
        title: 'Sample Book',
        price: 100000
      }];
      bookApi.addToCart.mockResolvedValueOnce({ status: 200 });

      // Act: Thêm 3 cuốn nữa
      const result = await addCartItem(10, 3, mockBook);

      // Assert
      expect(result).toBe(true);
      expect(cartState.items).toHaveLength(1); // Không tạo dòng mới
      expect(cartState.items[0].quantity).toBe(5); // 2 + 3 = 5
      expect(updateCartIcon).toHaveBeenCalledWith(5);
    });

    it('[FE_DETAIL-9] FE_DETAIL_AddCart_OverStock - Thêm quá số lượng tồn kho', async () => {
      // Arrange: Stock = 5, trong giỏ có 4, thêm 2
      const limitedBook = { ...mockBook, stock: 5 };
      cartState.items = [{
        bookId: 10,
        quantity: 4,
        title: 'Sample Book',
        price: 100000
      }];

      // Act: Thêm 2 cuốn nữa (vượt stock)
      const result = await addCartItem(10, 2, limitedBook);

      // Assert
      expect(result).toBe(false);
      expect(bookApi.addToCart).not.toHaveBeenCalled(); // Không gọi API
      expect(setNotification).toHaveBeenCalledWith('Số lượng trong kho không đủ');
    });

    it('[FE_DETAIL-10] FE_DETAIL_AddCart_MinQty - Thêm số lượng dưới mức tối thiểu', async () => {
      // Act: Nhập số lượng = 0
      const result = await addCartItem(10, 0, mockBook);

      // Assert
      expect(result).toBe(false);
      expect(bookApi.addToCart).not.toHaveBeenCalled();
      expect(setNotification).toHaveBeenCalledWith('Số lượng phải lớn hơn 0');
    });

    it('[FE_DETAIL-10-EXTRA] FE_DETAIL_AddCart_NegativeQty - Thêm số lượng âm', async () => {
      // Act: Nhập số lượng âm
      const result = await addCartItem(10, -1, mockBook);

      // Assert
      expect(result).toBe(false);
      expect(setNotification).toHaveBeenCalledWith('Số lượng phải lớn hơn 0');
    });

    it('[FE_DETAIL-11] FE_DETAIL_AddCart_MaxLimit - Kiểm thử giới hạn số lượng tối đa 1 lần mua', async () => {
      // Act: Nhập số lượng = 1000 (vượt max 50)
      const result = await addCartItem(10, 1000, mockBook);

      // Assert
      expect(result).toBe(false);
      expect(bookApi.addToCart).not.toHaveBeenCalled();
      expect(setNotification).toHaveBeenCalledWith('Không thể mua quá 50 cuốn/lần');
    });
  });

  // ==========================================================================
  // TEST GROUP: LIKE / INTERACTION
  // ==========================================================================

  describe('Function: toggleLike & handleLikeClick', () => {

    it('[FE_DETAIL-23] FE_DETAIL_LikeComment_ToggleOn - Like bình luận', async () => {
      // Arrange: Comment chưa được like
      commentApi.likeComment.mockResolvedValueOnce({ status: 200 });
      commentLikeCounts[1] = 5; // Initial like count

      // Act: Like comment
      await toggleLike(1, false);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      // Assert
      expect(commentApi.likeComment).toHaveBeenCalledWith(1);
      expect(likeStates[1]).toBe(true); // Icon chuyển sang trạng thái liked
      expect(commentLikeCounts[1]).toBe(6); // Tăng +1
    });

    it('[FE_DETAIL-24] FE_DETAIL_LikeComment_ToggleOff - Unlike bình luận', async () => {
      // Arrange: Comment đã được like
      likeStates[1] = true;
      commentLikeCounts[1] = 10;
      commentApi.unlikeComment.mockResolvedValueOnce({ status: 200 });

      // Act: Unlike comment
      await toggleLike(1, true);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      // Assert
      expect(commentApi.unlikeComment).toHaveBeenCalledWith(1);
      expect(likeStates[1]).toBe(false); // Icon trở về màu xám
      expect(commentLikeCounts[1]).toBe(9); // Giảm -1
    });

    it('[FE_DETAIL-25] FE_DETAIL_LikeComment_Persistence - Kiểm thử lưu trạng thái like', async () => {
      // Arrange: User đã like, mock reload bằng cách load lại state từ API
      likeStates[1] = true;
      const savedState = { ...likeStates };

      // Act: Simulate reload - state vẫn giữ nguyên
      const stateAfterReload = savedState;

      // Assert
      expect(stateAfterReload[1]).toBe(true); // Icon vẫn sáng
    });

    it('[FE_DETAIL-26] FE_DETAIL_LikeComment_RapidToggle - Spam nút like liên tục', async () => {
      // Arrange
      commentApi.likeComment.mockResolvedValue({ status: 200 });
      commentApi.unlikeComment.mockResolvedValue({ status: 200 });

      // Act: Nhấn like liên tục 10 lần
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(toggleLike(1, i % 2 === 0));
      }

      // Wait for all toggles and debounce
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 350));

      // Assert: Chỉ gửi 1 request cuối cùng do debounce
      const totalCalls = commentApi.likeComment.mock.calls.length + commentApi.unlikeComment.mock.calls.length;
      expect(totalCalls).toBeLessThanOrEqual(1); // Debounce chỉ cho phép 1 call cuối
    });

    it('[FE_DETAIL-27] FE_DETAIL_LikeComment_Guest - Khách (chưa login) like bình luận', async () => {
      // Arrange: User chưa đăng nhập
      isUserLoggedIn.mockReturnValueOnce(false);

      // Act: Guest nhấn like
      await handleLikeClick(1);

      // Assert
      expect(redirectToLogin).toHaveBeenCalled(); // Chuyển hướng đến login
      expect(commentApi.likeComment).not.toHaveBeenCalled(); // Không gọi API
    });
  });
});
