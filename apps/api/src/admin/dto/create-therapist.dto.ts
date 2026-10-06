import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTherapistDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  // Supabase Auth domyslnie wymaga co najmniej 6 znakow, dajemy troche wiecej
  @IsString()
  @MinLength(8)
  password: string;
}
