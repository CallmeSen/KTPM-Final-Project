import { IsUUID, IsArray, ValidateNested, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemDto } from 'src/modules/Payment/dto/Item.dto';

export class OrderDto {

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsDateString()
  @IsNotEmpty()
  orderDate: Date; // ISO format date (e.g., "2025-04-07T13:00:00Z")

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
  
}
