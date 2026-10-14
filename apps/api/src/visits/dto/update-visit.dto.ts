import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

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
  @Matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
  icd10Code?: string | null;

  @IsOptional()
  @IsString()
  treatment?: string | null;

  @IsOptional()
  @IsString()
  recommendations?: string | null;
}
