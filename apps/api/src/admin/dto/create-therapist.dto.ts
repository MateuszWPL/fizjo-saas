import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTherapistDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string | null;

  @IsEmail()
  email: string;

  // Supabase Auth domyslnie wymaga co najmniej 6 znakow, dajemy troche wiecej
  @IsString()
  @MinLength(8)
  password: string;
}
