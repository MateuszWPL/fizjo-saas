import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class CreateVisitDto {
  @IsDateString()
  visitDate: string;

  @IsOptional()
  @IsString()
  interview?: string | null;

  @IsOptional()
  @IsString()
  examination?: string | null;

  @IsOptional()
  @IsString()
  diagnosis?: string | null;

  // litera, dwie cyfry i opcjonalny podkod po kropce, np. M54 albo M54.5
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
