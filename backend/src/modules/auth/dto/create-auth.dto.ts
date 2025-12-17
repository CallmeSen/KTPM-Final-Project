import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsDateString,
    IsMongoId
  } from 'class-validator';
  
  export class CreateAuthDto {
    @IsString()
    @IsNotEmpty({ message: 'username is empty' })
    username: string;
  
    @IsString()
    @IsNotEmpty({ message: 'password is empty' })
    password: string;
  
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string  ;
  
    @IsOptional()
    @IsString()
    avatarUrl: string | null ;
  
    @IsOptional()
    @IsMongoId({ message: '' })
    role: string  ;
  
    @IsOptional()
    @IsBoolean()
    active: boolean | null ;
  
    @IsOptional()
    @IsBoolean()
    isVip: boolean | null ;

  }
  