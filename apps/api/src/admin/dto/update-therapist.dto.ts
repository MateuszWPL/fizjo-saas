import { IsBoolean } from 'class-validator';

export class UpdateTherapistDto {
  @IsBoolean()
  active: boolean;
}
