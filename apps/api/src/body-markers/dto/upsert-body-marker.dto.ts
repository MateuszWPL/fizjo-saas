import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertBodyMarkerDto {
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel: number;

  @IsOptional()
  @IsString()
  painType?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}
