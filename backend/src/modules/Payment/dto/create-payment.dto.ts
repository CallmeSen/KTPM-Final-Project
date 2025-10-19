import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {

  @IsNotEmpty()
  @IsString()
  amounts: string;


  @IsNotEmpty()
  @IsString()
  useId: string;


}
