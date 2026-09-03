import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { BodyMarkersService } from './body-markers.service.js';
import { UpsertBodyMarkerDto } from './dto/upsert-body-marker.dto.js';

@Controller('visits/:visitId/markers')
@UseGuards(AuthGuard)
export class BodyMarkersController {
  constructor(private readonly markers: BodyMarkersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.markers.listForVisit(user.id, visitId);
  }

  @Put(':group')
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Param('group') group: string,
    @Body() dto: UpsertBodyMarkerDto,
  ) {
    return this.markers.upsert(user.id, visitId, group, dto);
  }

  @Delete(':group')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Param('group') group: string,
  ) {
    return this.markers.remove(user.id, visitId, group);
  }
}
