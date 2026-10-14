import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { BodyMarkersService } from './body-markers.service.js';

@Controller('patients/:patientId/pain-history')
@UseGuards(AuthGuard)
export class PainHistoryController {
  constructor(private readonly markers: BodyMarkersService) {}

  @Get()
  history(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.markers.painHistory(user.id, patientId);
  }
}
