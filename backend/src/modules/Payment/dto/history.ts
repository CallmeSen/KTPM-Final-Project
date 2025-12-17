import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDto } from 'src/modules/Payment/dto/oder';

export class UserOrderHistoryDto {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders: OrderDto[];
  
}
