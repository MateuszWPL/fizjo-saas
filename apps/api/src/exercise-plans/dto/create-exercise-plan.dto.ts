import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ExercisePlanItemDto {
  @IsUUID()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  sets?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  reps?: number | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}

export class CreateExercisePlanDto {
  @IsOptional()
  @IsString()
  note?: string | null;

  // @Type mowi class-transformerowi, na jaka klase zamienic elementy tablicy,
  // bez tego walidatory z ExercisePlanItemDto nie zostalyby uruchomione
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExercisePlanItemDto)
  items: ExercisePlanItemDto[];
}
