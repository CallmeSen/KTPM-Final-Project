/**
 * Unit Test for Cart Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnail: string | null;
  isActive?: boolean;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  totalPrice: number;
  updatedAt: string;
  selectedItems?: number[];
}

interface PromoCode {
  code: string;
  discount: number;
  minSpend: number;
  expiryDate: Date;
}

// ============================================================================
// MOCK STATE & DEPENDENCIES
// ============================================================================

let cartState: Cart = {
  cartId: '1',
  items: [],
  totalPrice: 0,
  updatedAt: new Date().toISOString(),
  selectedItems: []
};

let showModal = false;
let modalType: 'confirm' | 'error' | null = null;
let toastMessage = '';
let isButtonDisabled = false;

const mockRouter = {
  push: jest.fn(),
  back: jest.fn()
};

const mockApi = {
  updateQuantity: jest.fn(),
  deleteItem: jest.fn(),
  applyPromo: jest.fn()
};

const showToast = jest.fn((message: string) => {
  toastMessage = message;
});

const showConfirmModal = jest.fn((message: string, onConfirm: () => void, onCancel: () => void) => {
  showModal = true;
  modalType = 'confirm';
  return { onConfirm, onCancel };
});

const closeModal = jest.fn(() => {
  showModal = false;
  modalType = null;
});

const setButtonDisabled = jest.fn((disabled: boolean) => {
  isButtonDisabled = disabled;
});

// ============================================================================
// FUNCTION: handleQuantityChange (Placeholder implementation)
// ============================================================================

const handleQuantityChange = async (
  productId: number,
  newQuantity: number,
  stock: number
): Promise<boolean> => {
  // BVA: Min boundary (1)
  if (newQuantity < 1) {
    // Below minimum - show confirm delete dialog
    if (newQuantity === 0) {
      showConfirmModal(
        'Xóa sản phẩm?',
        async () => {
          await mockApi.deleteItem(productId);
          cartState.items = cartState.items.filter(item => item.productId !== productId);
        },
        () => {
          // Do nothing
        }
      );
    }
    return false;
  }

  // BVA: Max boundary (stock)
  if (newQuantity > stock) {
    // Above maximum - reset to stock and show toast
    showToast(`Chỉ còn ${stock} sản phẩm trong kho`);
    return false;
  }

  // Type validation
  if (isNaN(newQuantity)) {
    // Invalid input - reset to 1
    return false;
  }

  // Valid range - update quantity
  try {
    await mockApi.updateQuantity(productId, newQuantity);
    
    const item = cartState.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = newQuantity;
    }

    // Disable increment button if at max
    if (newQuantity === stock) {
      setButtonDisabled(true);
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Debounced version
let debounceTimer: NodeJS.Timeout | null = null;

const handleQuantityChangeDebounced = (
  productId: number,
  newQuantity: number,
  stock: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      const result = await handleQuantityChange(productId, newQuantity, stock);
      resolve(result);
    }, 500);
  });
};

// ============================================================================
// FUNCTION: handleRemoveItem (Placeholder implementation)
// ============================================================================

const handleRemoveItem = async (productId: number): Promise<boolean> => {
  return new Promise((resolve) => {
    showConfirmModal(
      'Bạn có chắc muốn xóa?',
      async () => {
        try {
          // Call API to delete
          const response = await mockApi.deleteItem(productId);
          
          if (response.status === 200) {
            // Remove from state
            cartState.items = cartState.items.filter(item => item.productId !== productId);
            
            // Recalculate total
            cartState.totalPrice = calculateTotal(cartState.items);
            
            closeModal();
            resolve(true);
          } else {
            // API error - rollback UI
            showToast('Xóa thất bại, vui lòng thử lại');
            closeModal();
            resolve(false);
          }
        } catch (error) {
          showToast('Xóa thất bại, vui lòng thử lại');
          closeModal();
          resolve(false);
        }
      },
      () => {
        // Cancel - do nothing
        closeModal();
        resolve(false);
      }
    );
  });
};

// ============================================================================
// FUNCTION: handleCheckout (Placeholder implementation)
// ============================================================================

const handleCheckout = (isAuthenticated: boolean): void => {
  // Check if cart is empty
  if (cartState.items.length === 0) {
    showToast('Giỏ hàng đang trống');
    return;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login with return URL
    mockRouter.push('/login?redirect=/checkout');
    return;
  }

  // Navigate to checkout
  mockRouter.push('/checkout');
};

// ============================================================================
// FUNCTION: handleSelectAll (Placeholder implementation)
// ============================================================================

const handleSelectAll = (checked: boolean): void => {
  if (checked) {
    // Select all items
    cartState.selectedItems = cartState.items.map(item => item.productId);
  } else {
    // Deselect all
    cartState.selectedItems = [];
  }

  // Update total price based on selected items
  const selectedItemsData = cartState.items.filter(item => 
    cartState.selectedItems?.includes(item.productId)
  );
  cartState.totalPrice = calculateTotal(selectedItemsData);

  // Disable checkout button if none selected
  setButtonDisabled(cartState.selectedItems.length === 0);
};

const handleSelectSingle = (productId: number, checked: boolean): void => {
  if (!cartState.selectedItems) {
    cartState.selectedItems = [];
  }

  if (checked) {
    cartState.selectedItems.push(productId);
  } else {
    cartState.selectedItems = cartState.selectedItems.filter(id => id !== productId);
  }

  // Update total
  const selectedItemsData = cartState.items.filter(item => 
    cartState.selectedItems?.includes(item.productId)
  );
  cartState.totalPrice = calculateTotal(selectedItemsData);
};

// ============================================================================
// FUNCTION: applyPromoCode (Placeholder implementation)
// ============================================================================

const applyPromoCode = async (code: string, cartTotal: number): Promise<{ success: boolean; message?: string; discount?: number }> => {
  try {
    const response = await mockApi.applyPromo(code, cartTotal);

    if (response.status === 200) {
      return {
        success: true,
        discount: response.data.discount
      };
    } else if (response.status === 400 || response.status === 404) {
      return {
        success: false,
        message: response.message || 'Mã giảm giá không tồn tại'
      };
    }

    return { success: false };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra'
    };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total price from cart items
 */
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);
};

/**
 * Transform cart data for API payload
 */
const transformPayload = (cart: Cart): any => {
  return {
    cart_id: cart.cartId,
    items: cart.items.map(item => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: parseInt(item.quantity.toString(), 10), // Ensure integer
      unit_price: parseFloat(item.unitPrice.toString()), // Ensure number
      thumbnail: item.thumbnail || ''
    })),
    total_price: parseFloat(cart.totalPrice.toString()),
    note: cart.note !== undefined ? cart.note : '',
    updated_at: new Date().toISOString()
  };
};

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Cart Module - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset state
    cartState = {
      cartId: '1',
      items: [],
      totalPrice: 0,
      updatedAt: new Date().toISOString(),
      selectedItems: []
    };
    
    showModal = false;
    modalType = null;
    toastMessage = '';
    isButtonDisabled = false;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  // ==========================================================================
  // TEST GROUP: QUANTITY CHANGE (BVA)
  // ==========================================================================

  describe('Function: handleQuantityChange (BVA)', () => {

    it('[FE_CART-7] FE_CART_QtyChange_BVA_Min - Thay đổi về giá trị biên nhỏ nhất (Min=1)', async () => {
      // Arrange: Sản phẩm có số lượng 2, giảm xuống 1
      const stock = 10;
      mockApi.updateQuantity.mockResolvedValueOnce({ status: 200 });

      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 2, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Giảm xuống 1
      const result = await handleQuantityChange(1, 1, stock);

      // Assert
      expect(result).toBe(true); // Hàm cho phép cập nhật
      expect(cartState.items[0].quantity).toBe(1); // Giá trị = 1
      expect(mockApi.updateQuantity).toHaveBeenCalledWith(1, 1); // Gọi API thành công
    });

    it('[FE_CART-8] FE_CART_QtyChange_BVA_MinMinus - Thay đổi xuống dưới biên (Min-1)', async () => {
      // Arrange: Sản phẩm có số lượng 1, giảm xuống 0
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Nhập số 0
      const result = await handleQuantityChange(1, 0, 10);

      // Assert
      expect(result).toBe(false); // Return false ngay lập tức
      expect(mockApi.updateQuantity).not.toHaveBeenCalled(); // KHÔNG gọi API
      expect(showConfirmModal).toHaveBeenCalledWith(
        'Xóa sản phẩm?',
        expect.any(Function),
        expect.any(Function)
      ); // Hiển thị popup xác nhận
    });

    it('[FE_CART-9] FE_CART_QtyChange_BVA_Max - Thay đổi đến giới hạn tồn kho (Max=Stock)', async () => {
      // Arrange: Stock = 10, quantity = 9, tăng lên 10
      const stock = 10;
      mockApi.updateQuantity.mockResolvedValueOnce({ status: 200 });

      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 9, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Tăng lên 10
      const result = await handleQuantityChange(1, 10, stock);

      // Assert
      expect(result).toBe(true); // Cho phép cập nhật
      expect(cartState.items[0].quantity).toBe(10); // Không hiển thị lỗi
      expect(setButtonDisabled).toHaveBeenCalledWith(true); // Nút "Tăng" disabled
    });

    it('[FE_CART-10] FE_CART_QtyChange_BVA_MaxPlus - Thay đổi vượt quá tồn kho (Max+1)', async () => {
      // Arrange: Stock = 10, nhập 11
      const stock = 10;

      // Act: Nhập 11
      const result = await handleQuantityChange(1, 11, stock);

      // Assert
      expect(result).toBe(false); // Chặn lại
      expect(showToast).toHaveBeenCalledWith('Chỉ còn 10 sản phẩm trong kho'); // Hiển thị Toast Error
      expect(mockApi.updateQuantity).not.toHaveBeenCalled(); // Không gọi API với số 11
    });

    it('[FE_CART-11] FE_CART_QtyChange_Debounce - Kiểm thử gọi hàm liên tục', async () => {
      // Arrange: Mock API
      mockApi.updateQuantity.mockResolvedValue({ status: 200 });

      // Act: Click tăng 10 lần liên tiếp
      const promises = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(handleQuantityChangeDebounced(1, i, 20));
      }

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 600));
      await Promise.all(promises);

      // Assert: Chỉ có 1 request cuối cùng được gửi
      expect(mockApi.updateQuantity).toHaveBeenCalledTimes(1);
      expect(mockApi.updateQuantity).toHaveBeenCalledWith(1, 10); // Số lượng mới nhất
    });

    it('[FE_CART-12] FE_CART_QtyChange_InvalidType - Nhập ký tự không phải số', async () => {
      // Act: Nhập "abc"
      const invalidInput = parseInt('abc', 10);
      const result = await handleQuantityChange(1, invalidInput, 10);

      // Assert
      expect(isNaN(invalidInput)).toBe(true); // ParseInt trả về NaN
      expect(result).toBe(false); // Logic set lại thành 1 hoặc reject
    });
  });

  // ==========================================================================
  // TEST GROUP: REMOVE ITEM
  // ==========================================================================

  describe('Function: handleRemoveItem', () => {

    it('[FE_CART-13] FE_CART_Remove_Confirm - Xác nhận xóa thành công', async () => {
      // Arrange: Cart có Product A
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];
      cartState.totalPrice = 100;

      mockApi.deleteItem.mockResolvedValueOnce({ status: 200 });

      // Act: Click xóa và confirm
      const removePromise = handleRemoveItem(1);
      
      // Simulate user clicking "Đồng ý"
      const confirmCall = showConfirmModal.mock.calls[0];
      const onConfirm = confirmCall[1];
      await onConfirm();

      await removePromise;

      // Assert
      expect(mockApi.deleteItem).toHaveBeenCalledWith(1); // API DELETE được gọi
      expect(cartState.items).toHaveLength(0); // Sản phẩm biến mất
      expect(closeModal).toHaveBeenCalled(); // Popup đóng
    });

    it('[FE_CART-14] FE_CART_Remove_Cancel - Hủy bỏ hành động xóa', async () => {
      // Arrange
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Click xóa và cancel
      const removePromise = handleRemoveItem(1);
      
      // Simulate user clicking "Hủy"
      const confirmCall = showConfirmModal.mock.calls[0];
      const onCancel = confirmCall[2];
      onCancel();

      await removePromise;

      // Assert
      expect(mockApi.deleteItem).not.toHaveBeenCalled(); // KHÔNG có API DELETE
      expect(cartState.items).toHaveLength(1); // Sản phẩm VẪN CÒN
      expect(closeModal).toHaveBeenCalled();
    });

    it('[FE_CART-16] FE_CART_Remove_ApiError - Xử lý lỗi API khi xóa', async () => {
      // Arrange: Mock API trả về lỗi 500
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      mockApi.deleteItem.mockResolvedValueOnce({ status: 500 });

      // Act: Click xóa và confirm
      const removePromise = handleRemoveItem(1);
      
      const confirmCall = showConfirmModal.mock.calls[0];
      const onConfirm = confirmCall[1];
      await onConfirm();

      await removePromise;

      // Assert
      expect(showToast).toHaveBeenCalledWith('Xóa thất bại, vui lòng thử lại'); // Hiển thị lỗi
      expect(cartState.items).toHaveLength(1); // Sản phẩm KHÔNG biến mất (Rollback UI)
    });

    it('[FE_CART-17] FE_CART_Remove_LastItem - Xóa sản phẩm cuối cùng', async () => {
      // Arrange: Chỉ có 1 sản phẩm
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      mockApi.deleteItem.mockResolvedValueOnce({ status: 200 });

      // Act: Xóa thành công
      const removePromise = handleRemoveItem(1);
      
      const confirmCall = showConfirmModal.mock.calls[0];
      await confirmCall[1](); // Execute onConfirm

      await removePromise;

      // Assert
      expect(cartState.items).toHaveLength(0); // Empty cart
      // UI should show empty state with "Tiếp tục mua sắm" button
    });
  });

  // ==========================================================================
  // TEST GROUP: CHECKOUT FLOW
  // ==========================================================================

  describe('Function: handleCheckout', () => {

    it('[FE_CART-18] FE_CART_Checkout_Redirect - Điều hướng sang trang thanh toán', () => {
      // Arrange: Cart có ít nhất 1 sản phẩm
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Click "Thanh toán"
      handleCheckout(true);

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith('/checkout'); // Chuyển hướng
    });

    it('[FE_CART-19] FE_CART_Checkout_EmptyCart - Chặn thanh toán khi giỏ rỗng', () => {
      // Arrange: Cart rỗng
      cartState.items = [];

      // Act: Click "Thanh toán"
      handleCheckout(true);

      // Assert
      expect(showToast).toHaveBeenCalledWith('Giỏ hàng đang trống'); // Báo lỗi
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('[FE_CART-20] FE_CART_Checkout_Unauth - Thanh toán khi chưa đăng nhập', () => {
      // Arrange: User chưa đăng nhập, có hàng trong giỏ
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' }
      ];

      // Act: Click "Thanh toán"
      handleCheckout(false);

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith('/login?redirect=/checkout'); // Redirect to login
    });
  });

  // ==========================================================================
  // TEST GROUP: SELECTION
  // ==========================================================================

  describe('Function: handleSelectAll & handleSelectSingle', () => {

    beforeEach(() => {
      cartState.items = [
        { productId: 1, productName: 'Product A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' },
        { productId: 2, productName: 'Product B', quantity: 2, unitPrice: 200, thumbnail: 'img.jpg' },
        { productId: 3, productName: 'Product C', quantity: 1, unitPrice: 150, thumbnail: 'img.jpg' }
      ];
    });

    it('[FE_CART-21] FE_CART_Select_All - Chọn tất cả sản phẩm', () => {
      // Act: Click "Chọn tất cả"
      handleSelectAll(true);

      // Assert
      expect(cartState.selectedItems).toHaveLength(3); // Cả 3 checkbox được tích
      expect(cartState.selectedItems).toEqual([1, 2, 3]);
      expect(cartState.totalPrice).toBe(650); // 100 + 400 + 150
    });

    it('[FE_CART-22] FE_CART_Select_Single - Chọn từng sản phẩm lẻ', () => {
      // Act: Chọn Product A và B
      handleSelectSingle(1, true);
      handleSelectSingle(2, true);

      // Assert
      expect(cartState.selectedItems).toEqual([1, 2]);
      expect(cartState.totalPrice).toBe(500); // 100 + 400
    });

    it('[FE_CART-23] FE_CART_Select_None - Bỏ chọn tất cả', () => {
      // Arrange: Đang chọn tất cả
      cartState.selectedItems = [1, 2, 3];
      cartState.totalPrice = 650;

      // Act: Bỏ chọn tất cả
      handleSelectAll(false);

      // Assert
      expect(cartState.selectedItems).toHaveLength(0); // Tất cả bị bỏ chọn
      expect(cartState.totalPrice).toBe(0); // Tổng tiền về 0
      expect(setButtonDisabled).toHaveBeenCalledWith(true); // Nút "Mua hàng" disabled
    });
  });

  // ==========================================================================
  // TEST GROUP: PROMO CODE
  // ==========================================================================

  describe('Function: applyPromoCode', () => {

    it('[FE_CART-24] FE_CART_Promo_Valid - Áp dụng mã giảm giá hợp lệ', async () => {
      // Arrange: Mã hợp lệ
      mockApi.applyPromo.mockResolvedValueOnce({
        status: 200,
        data: { discount: 0.1 } // 10%
      });

      // Act: Nhập mã "SALE10"
      const result = await applyPromoCode('SALE10', 1000);

      // Assert
      expect(result.success).toBe(true);
      expect(result.discount).toBe(0.1);
    });

    it('[FE_CART-25] FE_CART_Promo_Invalid - Áp dụng mã giảm giá sai', async () => {
      // Arrange: Mã không tồn tại
      mockApi.applyPromo.mockResolvedValueOnce({
        status: 404,
        message: 'Mã giảm giá không tồn tại'
      });

      // Act: Nhập mã "INVALID"
      const result = await applyPromoCode('INVALID', 1000);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Mã giảm giá không tồn tại');
    });

    it('[FE_CART-26] FE_CART_Promo_Expired - Áp dụng mã hết hạn', async () => {
      // Arrange: Mã hết hạn
      mockApi.applyPromo.mockResolvedValueOnce({
        status: 400,
        message: 'Mã giảm giá đã hết hạn'
      });

      // Act: Nhập mã "EXPIRED"
      const result = await applyPromoCode('EXPIRED', 1000);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Mã giảm giá đã hết hạn');
    });

    it('[FE_CART-27] FE_CART_Promo_Condition - Mã không đủ điều kiện', async () => {
      // Arrange: Đơn hàng chưa đủ điều kiện
      mockApi.applyPromo.mockResolvedValueOnce({
        status: 400,
        message: 'Đơn hàng chưa đủ điều kiện áp dụng'
      });

      // Act: Giỏ hàng 500k, mã yêu cầu >1M
      const result = await applyPromoCode('BIGSALE', 500000);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('chưa đủ điều kiện');
    });
  });

  // ==========================================================================
  // TEST GROUP: HELPER FUNCTIONS
  // ==========================================================================

  describe('Helper Functions', () => {

    it('[FE_CART-30] FE_CART_CalculateTotal_Simple - Tính tổng tiền đơn giản', () => {
      // Arrange: Item A: 10$ x 2
      const items: CartItem[] = [
        { productId: 1, productName: 'Item A', quantity: 2, unitPrice: 10, thumbnail: 'img.jpg' }
      ];

      // Act
      const total = calculateTotal(items);

      // Assert
      expect(total).toBe(20); // Output: 20$
    });

    it('[FE_CART-31] FE_CART_CalculateTotal_Complex - Tính tổng tiền phức tạp', () => {
      // Arrange: Item A: 10.5$ x 2, Item B: 5.25$ x 4
      const items: CartItem[] = [
        { productId: 1, productName: 'Item A', quantity: 2, unitPrice: 10.5, thumbnail: 'img.jpg' },
        { productId: 2, productName: 'Item B', quantity: 4, unitPrice: 5.25, thumbnail: 'img.jpg' }
      ];

      // Act
      const total = calculateTotal(items);

      // Assert
      expect(total).toBe(42); // 21 + 21 = 42
    });

    it('[FE_CART-32] FE_CART_Payload_TypeConvert - Chuyển đổi kiểu dữ liệu', () => {
      // Arrange: Price là string
      const cart: any = {
        cartId: '1',
        items: [
          { productId: 1, productName: 'Item', quantity: '2', unitPrice: '50000', thumbnail: null }
        ],
        totalPrice: '100000',
        updatedAt: new Date().toISOString()
      };

      // Act
      const payload = transformPayload(cart);

      // Assert
      expect(typeof payload.total_price).toBe('number'); // Phải là Number
      expect(payload.total_price).toBe(100000);
      expect(typeof payload.items[0].quantity).toBe('number'); // Integer
      expect(payload.items[0].quantity).toBe(2);
    });

    it('[FE_CART-33] FE_CART_Payload_NestedMap - Kiểm thử cấu trúc mảng lồng nhau', () => {
      // Arrange: Cart có 3 sản phẩm
      const cart: Cart = {
        cartId: '1',
        items: [
          { productId: 1, productName: 'A', quantity: 1, unitPrice: 100, thumbnail: 'img.jpg' },
          { productId: 2, productName: 'B', quantity: 2, unitPrice: 200, thumbnail: 'img.jpg' },
          { productId: 3, productName: 'C', quantity: 1, unitPrice: 150, thumbnail: 'img.jpg' }
        ],
        totalPrice: 650,
        updatedAt: new Date().toISOString()
      };

      // Act
      const payload = transformPayload(cart);

      // Assert
      expect(payload.items).toHaveLength(3); // Length = 3
      expect(payload.items[0].product_id).toBe(1); // Thứ tự giữ nguyên
      expect(payload.items[2].product_id).toBe(3);
    });

    it('[FE_CART-34] FE_CART_Payload_NullValues - Xử lý giá trị không bắt buộc', () => {
      // Arrange: Note = undefined
      const cart: any = {
        cartId: '1',
        items: [],
        totalPrice: 0,
        updatedAt: new Date().toISOString(),
        note: undefined
      };

      // Act
      const payload = transformPayload(cart);

      // Assert
      expect(payload).toHaveProperty('note'); // Key tồn tại
      expect(payload.note).toBe(''); // Giá trị là chuỗi rỗng
      expect(payload.note).not.toBeUndefined(); // KHÔNG gửi undefined
    });

    it('[FE_CART-35] FE_CART_Payload_DateFormat - Định dạng lại ngày tháng', () => {
      // Arrange: Object Date
      const cart: Cart = {
        cartId: '1',
        items: [],
        totalPrice: 0,
        updatedAt: new Date().toISOString()
      };

      // Act
      const payload = transformPayload(cart);

      // Assert
      expect(typeof payload.updated_at).toBe('string'); // Phải là string
      expect(payload.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
    });
  });
});
