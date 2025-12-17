import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryInput } from './dto/create-inventory.input';
import { UpdateInventoryInput } from './dto/update-inventory.input';

@Resolver(() => Inventory)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Mutation(() => Inventory)
  createInventory(@Args('createInventoryInput') createInventoryInput: CreateInventoryInput) {
    return this.inventoryService.create(createInventoryInput);
  }

  @Query(() => [Inventory], { name: 'inventory' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Query(() => Inventory, { name: 'inventory' })
  findOne(@Args('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Mutation(() => Inventory)
  updateInventory(@Args('updateInventoryInput') updateInventoryInput: UpdateInventoryInput) {
    return this.inventoryService.update("211", updateInventoryInput.quantity);
  }

  @Mutation(() => Inventory)
  removeInventory(@Args('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
