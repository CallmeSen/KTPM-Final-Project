import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryInput } from './dto/create-inventory.input';
import { UpdateInventoryInput } from './dto/update-inventory.input';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  create(createInventoryInput: CreateInventoryInput) {
    const newInventory = this.inventoryRepository.create(createInventoryInput);
    return this.inventoryRepository.save(newInventory);
  }

  findAll() {
    return this.inventoryRepository.find();
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(id: string, updateInventoryInput: UpdateInventoryInput) {
    const inventory = await this.findOne(id);
    Object.assign(inventory, updateInventoryInput);
    return this.inventoryRepository.save(inventory);
  }

  async remove(id: string) {
    const inventory = await this.findOne(id);
    return this.inventoryRepository.remove(inventory);
  }
}