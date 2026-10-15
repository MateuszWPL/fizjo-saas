import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class CreateOutcomeDto {
  @IsIn(['ODI', 'NDI'])
  type: 'ODI' | 'NDI';

  // oba kwestionariusze maja po 10 pytan punktowanych od 0 do 5
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(5, { each: true })
  answers: number[];
}
