import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateVisitDto {
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsString()
  interview?: string | null;

  @IsOptional()
  @IsString()
  examination?: string | null;

  @IsOptional()
  @IsString()
  diagnosis?: string | null;

  @IsOptional()
  @IsString()
  recommendations?: string | null;
}
