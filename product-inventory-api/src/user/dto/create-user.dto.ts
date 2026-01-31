import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsIn(['user','admin'])
    role?: string;
}
