import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  defaultSets?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  defaultReps?: number | null;
}
