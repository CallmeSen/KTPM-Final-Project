import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { Inventory } from '../../modules/inventory/entities/inventory.entity';
import { NotFoundException } from '@nestjs/common';

// Mock repository
const mockInventoryRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(), 
  remove: jest.fn(),
});

describe('InventoryService (Unit Test)', () => {
  let service: InventoryService;
  let repo: ReturnType<typeof mockInventoryRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useFactory: mockInventoryRepo,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repo = module.get(getRepositoryToken(Inventory));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('should create inventory successfully', async () => {
      const dto = { productId: 'P01', quantity: 100 };
      const inventory = { id: '1', ...dto } as Inventory;

      repo.create.mockReturnValue(inventory);
      repo.save.mockResolvedValue(inventory);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(inventory);
      expect(result).toEqual(inventory);
    });
  });

  describe('findAll()', () => {
    it('should return inventory list', async () => {
      const inventories = [{ id: '1' }, { id: '2' }] as Inventory[];
      repo.find.mockResolvedValue(inventories);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(inventories);
    });
  });

  describe('findOne()', () => {
    it('should return inventory if found', async () => {
      const inventory = { id: '1' } as Inventory;
      repo.findOne.mockResolvedValue(inventory);

      const result = await service.findOne('1');

      expect(result).toEqual(inventory);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update inventory successfully', async () => {
      const inventory = { id: '1', quantity: 10 } as Inventory;
      repo.findOne.mockResolvedValue(inventory);
      repo.save.mockResolvedValue({ ...inventory, quantity: 20 });

      const result = await service.update('1', 20);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', quantity: 20 }),
      );
      expect(result.quantity).toBe(20);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('999', 20)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should remove inventory successfully', async () => {
      const inventory = { id: '1' } as Inventory;
      repo.findOne.mockResolvedValue(inventory);
      repo.remove.mockResolvedValue(inventory);

      const result = await service.remove('1');

      expect(repo.remove).toHaveBeenCalledWith(inventory);
      expect(result).toEqual(inventory);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
