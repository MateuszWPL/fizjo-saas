import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAmendmentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
