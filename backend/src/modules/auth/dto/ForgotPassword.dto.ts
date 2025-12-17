import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ForgotPasswordDto {

    @IsString()
    @IsOptional()
    @IsNotEmpty({message:"email is empty"})
    @IsEmail()
    email: string
}
