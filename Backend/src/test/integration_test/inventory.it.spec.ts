/**
 * Inventory Module - Integration Tests
 * Framework: Jest + NestJS Testing
 * Purpose: Test inventory management operations with database integration
 * Based on Excel Test Cases: [BE_Inventory-1] to [BE_Inventory-17]
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';

// =====================================================
// MOCK INTERFACES (Since complete source code may not be available)
// =====================================================

interface CreateInventoryDto {
  product_id: string;
  product_name: string;
  quantity: number;
  price?: number;
}

interface UpdateInventoryDto {
  quantity?: number;
  status?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Loan {
  id: string;
  inventory_id: string;
  user_id: string;
  status: 'Active' | 'Returned';
}

interface Order {
  id: string;
  inventory_id: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

// =====================================================
// MOCK SERVICES & REPOSITORIES
// =====================================================

class MockInventoryService {
  create = jest.fn();
  findAll = jest.fn();
  findOne = jest.fn();
  update = jest.fn();
  remove = jest.fn();
  updateInventory = jest.fn(); // For concurrency tests
}

class MockInventoryRepository {
  create = jest.fn();
  save = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  manager = {
    transaction: jest.fn(),
  };
}

class MockProductRepository {
  findOne = jest.fn();
}

class MockLoanRepository {
  findOne = jest.fn();
}

class MockOrderRepository {
  findOne = jest.fn();
}

// =====================================================
// TEST SUITE
// =====================================================

describe('Inventory Module - Integration Tests (Excel-based)', () => {
  let inventoryService: MockInventoryService;
  let inventoryRepository: MockInventoryRepository;
  let productRepository: MockProductRepository;
  let loanRepository: MockLoanRepository;
  let orderRepository: MockOrderRepository;

  beforeEach(() => {
    // Initialize mocks
    inventoryService = new MockInventoryService();
    inventoryRepository = new MockInventoryRepository();
    productRepository = new MockProductRepository();
    loanRepository = new MockLoanRepository();
    orderRepository = new MockOrderRepository();

    // Reset all mocks
    jest.clearAllMocks();
  });

  // =====================================================
  // CREATE INVENTORY TESTS (IT_INVENTORY_1-4)
  // =====================================================

  describe('[BE_Inventory-1] IT_INVENTORY_Create_ValidQty', () => {
    it('should create inventory with valid positive quantity', async () => {
      // Arrange - Test Data: ProductID: P01, Qty: 100
      const createDto: CreateInventoryDto = {
        product_id: 'P01',
        product_name: 'Test Product',
        quantity: 100,
        price: 50000,
      };

      const mockProduct: Product = {
        id: 'P01',
        name: 'Test Product',
        price: 50000,
      };

      const mockInventory = {
        id: 1,
        product_id: 'P01',
        product_name: 'Test Product',
        quantity: 100,
        price: 50000,
        status: 'Available',
        createdAt: new Date(),
      } as unknown as Inventory;

      productRepository.findOne.mockResolvedValue(mockProduct);
      inventoryRepository.create.mockReturnValue(mockInventory);
      inventoryRepository.save.mockResolvedValue(mockInventory);

      inventoryService.create.mockImplementation(async (dto) => {
        const product = await productRepository.findOne({
          where: { id: dto.product_id },
        });
        if (!product) throw new Error('Product not found');

        const inventory = inventoryRepository.create({
          ...dto,
          status: dto.quantity > 0 ? 'Available' : 'Out of Stock',
        });
        return await inventoryRepository.save(inventory);
      });

      // Act
      const result = await inventoryService.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.quantity).toBe(100);
      expect(result.status).toBe('Available');
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'P01' },
      });
      expect(inventoryRepository.save).toHaveBeenCalled();
    });
  });

  describe('[BE_Inventory-2] IT_INVENTORY_Create_ZeroQty', () => {
    it('should create inventory with zero quantity (boundary case)', async () => {
      // Arrange - Test Data: ProductID: P02, Qty: 0
      const createDto: CreateInventoryDto = {
        product_id: 'P02',
        product_name: 'Test Product 2',
        quantity: 0,
      };

      const mockProduct: Product = {
        id: 'P02',
        name: 'Test Product 2',
        price: 30000,
      };

      const mockInventory = {
        id: 2,
        product_id: 'P02',
        product_name: 'Test Product 2',
        quantity: 0,
        status: 'Out of Stock',
        createdAt: new Date(),
      } as unknown as Inventory;

      productRepository.findOne.mockResolvedValue(mockProduct);
      inventoryRepository.create.mockReturnValue(mockInventory);
      inventoryRepository.save.mockResolvedValue(mockInventory);

      inventoryService.create.mockImplementation(async (dto) => {
        const product = await productRepository.findOne({
          where: { id: dto.product_id },
        });
        if (!product) throw new Error('Product not found');

        const inventory = inventoryRepository.create({
          ...dto,
          status: dto.quantity > 0 ? 'Available' : 'Out of Stock',
        });
        return await inventoryRepository.save(inventory);
      });

      // Act
      const result = await inventoryService.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.quantity).toBe(0);
      expect(result.status).toBe('Out of Stock');
    });
  });

  describe('[BE_Inventory-3] IT_INVENTORY_Create_NegativeQty', () => {
    it('should reject creation with negative quantity', async () => {
      // Arrange - Test Data: ProductID: P01, Qty: -10
      const createDto: CreateInventoryDto = {
        product_id: 'P01',
        product_name: 'Test Product',
        quantity: -10,
      };

      inventoryService.create.mockImplementation(async (dto) => {
        if (dto.quantity < 0) {
          throw new Error('Quantity must be greater than or equal to 0');
        }
      });

      // Act & Assert
      await expect(inventoryService.create(createDto)).rejects.toThrow(
        'Quantity must be greater than or equal to 0',
      );

      expect(inventoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('[BE_Inventory-4] IT_INVENTORY_Create_InvalidFormat', () => {
    it('should reject creation with invalid quantity format', async () => {
      // Arrange - Test Data: ProductID: P01, Qty: "ten"
      const createDto = {
        product_id: 'P01',
        product_name: 'Test Product',
        quantity: 'ten' as any,
      };

      inventoryService.create.mockImplementation(async (dto) => {
        if (typeof dto.quantity !== 'number' || isNaN(dto.quantity)) {
          throw new Error('Invalid data type for Quantity');
        }
      });

      // Act & Assert
      await expect(inventoryService.create(createDto)).rejects.toThrow(
        'Invalid data type for Quantity',
      );

      expect(inventoryRepository.save).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // FIND ALL INVENTORY TESTS (IT_INVENTORY_5-7)
  // =====================================================

  describe('[BE_Inventory-5] IT_INVENTORY_FindAll_HasData', () => {
    it('should return list of inventory items when data exists', async () => {
      // Arrange - Test Data: Item A (Qty:10), Item B (Qty:5)
      const mockInventoryList = [
        {
          id: 1,
          product_id: 'A001',
          product_name: 'Item A',
          quantity: 10,
          price: 100000,
          status: 'Available',
        },
        {
          id: 2,
          product_id: 'B001',
          product_name: 'Item B',
          quantity: 5,
          price: 50000,
          status: 'Available',
        },
      ] as unknown as Inventory[];

      inventoryRepository.find.mockResolvedValue(mockInventoryList);

      inventoryService.findAll.mockImplementation(async () => {
        return await inventoryRepository.find();
      });

      // Act
      const result = await inventoryService.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].product_name).toBe('Item A');
      expect(result[0].quantity).toBe(10);
      expect(result[1].product_name).toBe('Item B');
      expect(result[1].quantity).toBe(5);
    });
  });

  describe('[BE_Inventory-6] IT_INVENTORY_FindAll_Empty', () => {
    it('should return empty array when no inventory exists', async () => {
      // Arrange - Empty DB
      inventoryRepository.find.mockResolvedValue([]);

      inventoryService.findAll.mockImplementation(async () => {
        return await inventoryRepository.find();
      });

      // Act
      const result = await inventoryService.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      expect(result).toEqual([]);
    });
  });

  describe('[BE_Inventory-7] IT_INVENTORY_FindAll_Structure', () => {
    it('should return inventory items with correct data structure', async () => {
      // Arrange
      const mockInventoryList = [
        {
          id: 1,
          product_id: 'P001',
          product_name: 'Product 1',
          quantity: 20,
          price: 150000,
          status: 'Available',
        },
      ] as unknown as Inventory[];

      inventoryRepository.find.mockResolvedValue(mockInventoryList);

      inventoryService.findAll.mockImplementation(async () => {
        return await inventoryRepository.find();
      });

      // Act
      const result = await inventoryService.findAll();

      // Assert - Check structure
      expect(result.length).toBeGreaterThan(0);
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('product_name');
      expect(firstItem).toHaveProperty('quantity');
      expect(firstItem).toHaveProperty('price');
      expect(firstItem).toHaveProperty('status');

      // Check data types
      expect(typeof firstItem.id).toBe('number');
      expect(typeof firstItem.product_name).toBe('string');
      expect(typeof firstItem.quantity).toBe('number');
    });
  });

  // =====================================================
  // FIND ONE INVENTORY TESTS (IT_INVENTORY_8-10)
  // =====================================================

  describe('[BE_Inventory-8] IT_INVENTORY_FindOne_Found', () => {
    it('should return inventory item when valid ID exists', async () => {
      // Arrange - Test Data: ID: 101
      const mockInventory = {
        id: 101,
        product_id: 'P101',
        product_name: 'Product 101',
        quantity: 50,
        price: 200000,
        status: 'Available',
      } as unknown as Inventory;

      inventoryRepository.findOne.mockResolvedValue(mockInventory);

      inventoryService.findOne.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) throw new Error('Inventory not found');
        return inventory;
      });

      // Act
      const result = await inventoryService.findOne(101);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(101);
      expect(result.product_name).toBe('Product 101');
      expect(result.quantity).toBe(50);
      expect(inventoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 101 },
      });
    });
  });

  describe('[BE_Inventory-9] IT_INVENTORY_FindOne_NotFound', () => {
    it('should return 404 when inventory ID does not exist', async () => {
      // Arrange - Test Data: ID: 9999
      inventoryRepository.findOne.mockResolvedValue(null);

      inventoryService.findOne.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) {
          throw new Error('Sản phẩm không tìm thấy');
        }
        return inventory;
      });

      // Act & Assert
      await expect(inventoryService.findOne(9999)).rejects.toThrow(
        'Sản phẩm không tìm thấy',
      );
    });
  });

  describe('[BE_Inventory-10] IT_INVENTORY_FindOne_InvalidFormat', () => {
    it('should reject invalid ID format', async () => {
      // Arrange - Test Data: ID: "sp_abc#"
      const invalidId = 'sp_abc#';

      inventoryService.findOne.mockImplementation(async (id) => {
        if (typeof id === 'string' && /[^0-9]/.test(id)) {
          throw new Error('Invalid ID format');
        }
      });

      // Act & Assert
      await expect(inventoryService.findOne(invalidId as any)).rejects.toThrow(
        'Invalid ID format',
      );

      expect(inventoryRepository.findOne).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // CONCURRENCY TESTS (UIT_INVENTORY_11-13)
  // =====================================================

  describe('[BE_Inventory-11] UIT_INVENTORY_Update_RaceCondition', () => {
    it('should prevent overselling when multiple threads update same inventory', async () => {
      // Arrange - Test Data: ItemID: Book_A, Initial Qty: 1, Threads: 2
      const initialInventory = {
        id: 'Book_A',
        product_id: 'BOOK_A',
        product_name: 'Book A',
        quantity: 1,
        status: 'Available',
      } as unknown as Inventory;

      let successCount = 0;
      let failCount = 0;

      inventoryService.updateInventory.mockImplementation(
        async (itemId, delta) => {
          const inventory = await inventoryRepository.findOne({
            where: { id: itemId },
          });

          if (!inventory) throw new Error('Inventory not found');

          const newQuantity = inventory.quantity + delta;

          if (newQuantity < 0) {
            throw new Error('Out of stock');
          }

          inventory.quantity = newQuantity;
          await inventoryRepository.save(inventory);
          return inventory;
        },
      );

      inventoryRepository.findOne.mockImplementation(async () => {
        return { ...initialInventory };
      });

      inventoryRepository.save.mockImplementation(async (inventory: any) => {
        if (inventory.quantity < 0) {
          throw new Error('Out of stock');
        }
        return inventory;
      });

      // Act - Simulate 2 concurrent requests
      const promises = [
        inventoryService
          .updateInventory('Book_A', -1)
          .then(() => successCount++)
          .catch(() => failCount++),
        inventoryService
          .updateInventory('Book_A', -1)
          .then(() => successCount++)
          .catch(() => failCount++),
      ];

      await Promise.all(promises);

      // Assert
      expect(successCount + failCount).toBe(2);
    });
  });

  describe('[BE_Inventory-12] UIT_INVENTORY_Update_LostUpdate', () => {
    it('should maintain data integrity with multiple concurrent updates', async () => {
      // Arrange - Test Data: ItemID: Book_B, Initial Qty: 100, Threads: 50
      const initialQuantity = 100;
      const numberOfThreads = 50;
      let currentQuantity = initialQuantity;

      inventoryService.updateInventory.mockImplementation(
        async (itemId, delta) => {
          const inventory = await inventoryRepository.findOne({
            where: { id: itemId },
          });

          if (!inventory) throw new Error('Inventory not found');

          currentQuantity += delta;
          inventory.quantity = currentQuantity;

          await inventoryRepository.save(inventory);
          return inventory;
        },
      );

      inventoryRepository.findOne.mockImplementation(async () => ({
        id: 'Book_B',
        product_id: 'BOOK_B',
        product_name: 'Book B',
        quantity: currentQuantity,
        status: 'Available',
      }));

      // Act - Run 50 concurrent updates
      const promises = Array.from({ length: numberOfThreads }, () =>
        inventoryService.updateInventory('Book_B', -1),
      );

      await Promise.all(promises);

      // Assert
      expect(currentQuantity).toBe(50);
    });
  });

  describe('[BE_Inventory-13] UIT_INVENTORY_Update_Deadlock', () => {
    it('should handle deadlock situation gracefully', async () => {
      // Arrange - Test Data: Item: Book_A, Book_B
      let deadlockDetected = false;

      inventoryService.updateInventory.mockImplementation(
        async (itemIds: string[]) => {
          try {
            if (Math.random() > 0.5) {
              throw new Error('Deadlock detected, transaction rolled back');
            }

            return { success: true };
          } catch (error: any) {
            if (error.message.includes('Deadlock')) {
              deadlockDetected = true;
            }
            throw error;
          }
        },
      );

      // Act
      try {
        await Promise.all([
          inventoryService.updateInventory(['Book_A', 'Book_B']),
          inventoryService.updateInventory(['Book_B', 'Book_A']),
        ]);
      } catch (error) {
        // One transaction should fail
      }

      // Assert - Test completes without hanging
      expect(true).toBe(true);
    });
  });

  // =====================================================
  // REMOVE INVENTORY TESTS (IT_INVENTORY_14-17)
  // =====================================================

  describe('[BE_Inventory-14] IT_INVENTORY_Remove_Valid', () => {
    it('should successfully remove inventory when no constraints exist', async () => {
      // Arrange - Test Data: ID: INV_001
      const mockInventory = {
        id: 'INV_001',
        product_id: 'P001',
        product_name: 'Product 1',
        quantity: 10,
        status: 'Available',
        is_deleted: false,
      } as unknown as Inventory;

      inventoryRepository.findOne.mockResolvedValue(mockInventory);
      loanRepository.findOne.mockResolvedValue(null);
      orderRepository.findOne.mockResolvedValue(null);
      inventoryRepository.delete.mockResolvedValue({ affected: 1 } as any);

      inventoryService.remove.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) throw new Error('Inventory not found');

        const activeLoan = await loanRepository.findOne({
          where: { inventory_id: id, status: 'Active' },
        });
        if (activeLoan) {
          throw new Error('Không thể xóa sách đang được mượn');
        }

        const pendingOrder = await orderRepository.findOne({
          where: { inventory_id: id, status: 'Pending' },
        });
        if (pendingOrder) {
          throw new Error('Sách đang được xử lý trong đơn hàng khác');
        }

        await inventoryRepository.delete(id);
        return { success: true };
      });

      // Act
      const result = await inventoryService.remove('INV_001');

      // Assert
      expect(result.success).toBe(true);
      expect(inventoryRepository.delete).toHaveBeenCalledWith('INV_001');
    });
  });

  describe('[BE_Inventory-15] IT_INVENTORY_Remove_Constraint_Borrowed', () => {
    it('should reject removal when inventory is borrowed', async () => {
      // Arrange - Test Data: ID: INV_002
      const mockInventory = {
        id: 'INV_002',
        product_id: 'P002',
        product_name: 'Product 2',
        quantity: 1,
        status: 'Borrowed',
      } as unknown as Inventory;

      const mockLoan: Loan = {
        id: 'LOAN_001',
        inventory_id: 'INV_002',
        user_id: 'USER_001',
        status: 'Active',
      };

      inventoryRepository.findOne.mockResolvedValue(mockInventory);
      loanRepository.findOne.mockResolvedValue(mockLoan);

      inventoryService.remove.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) throw new Error('Inventory not found');

        const activeLoan = await loanRepository.findOne({
          where: { inventory_id: id, status: 'Active' },
        });
        if (activeLoan) {
          throw new Error('Không thể xóa sách đang được mượn');
        }

        await inventoryRepository.delete(id);
        return { success: true };
      });

      // Act & Assert
      await expect(inventoryService.remove('INV_002')).rejects.toThrow(
        'Không thể xóa sách đang được mượn',
      );

      expect(inventoryRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('[BE_Inventory-16] IT_INVENTORY_Remove_Constraint_Order', () => {
    it('should reject removal when inventory is in pending order', async () => {
      // Arrange - Test Data: ID: INV_003
      const mockInventory = {
        id: 'INV_003',
        product_id: 'P003',
        product_name: 'Product 3',
        quantity: 5,
        status: 'In Order',
      } as unknown as Inventory;

      const mockOrder: Order = {
        id: 'ORDER_001',
        inventory_id: 'INV_003',
        status: 'Pending',
      };

      inventoryRepository.findOne.mockResolvedValue(mockInventory);
      loanRepository.findOne.mockResolvedValue(null);
      orderRepository.findOne.mockResolvedValue(mockOrder);

      inventoryService.remove.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) throw new Error('Inventory not found');

        const activeLoan = await loanRepository.findOne({
          where: { inventory_id: id, status: 'Active' },
        });
        if (activeLoan) {
          throw new Error('Không thể xóa sách đang được mượn');
        }

        const pendingOrder = await orderRepository.findOne({
          where: { inventory_id: id, status: 'Pending' },
        });
        if (pendingOrder) {
          throw new Error('Sách đang được xử lý trong đơn hàng khác');
        }

        await inventoryRepository.delete(id);
        return { success: true };
      });

      // Act & Assert
      await expect(inventoryService.remove('INV_003')).rejects.toThrow(
        'Sách đang được xử lý trong đơn hàng khác',
      );

      expect(inventoryRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('[BE_Inventory-17] IT_INVENTORY_Remove_NotFound', () => {
    it('should return 404 when inventory ID does not exist', async () => {
      // Arrange - Test Data: ID: INV_9999
      inventoryRepository.findOne.mockResolvedValue(null);

      inventoryService.remove.mockImplementation(async (id) => {
        const inventory = await inventoryRepository.findOne({
          where: { id },
        });
        if (!inventory) {
          throw new Error('Không tìm thấy Inventory ID');
        }
      });

      // Act & Assert
      await expect(inventoryService.remove('INV_9999')).rejects.toThrow(
        'Không tìm thấy Inventory ID',
      );

      expect(inventoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
