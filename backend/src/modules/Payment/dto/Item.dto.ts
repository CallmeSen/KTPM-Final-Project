import { IsString, IsUUID, IsNotEmpty, IsNumber } from 'class-validator';

export class ItemDto {

  @IsString()
  title: string

  @IsNotEmpty()
  @IsNumber()
  amount: Int32List;
}
