import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { VisitsService } from './visits.service.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';
import { UpdateVisitDto } from './dto/update-visit.dto.js';
import { CreateAmendmentDto } from './dto/create-amendment.dto.js';

@Controller()
@UseGuards(AuthGuard)
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Get('patients/:patientId/visits')
  listForPatient(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.visits.listForPatient(user.id, patientId);
  }

  @Post('patients/:patientId/visits')
  create(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateVisitDto,
  ) {
    return this.visits.create(user.id, patientId, dto);
  }

  @Get('visits/recent')
  recent(@CurrentUser() user: AuthUser) {
    return this.visits.recent(user.id);
  }

  @Get('visits/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visits.get(user.id, id);
  }

  @Patch('visits/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisitDto,
  ) {
    return this.visits.update(user.id, id, dto);
  }

  @Post('visits/:id/close')
  close(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visits.close(user.id, id);
  }

  @Post('visits/:id/amendments')
  addAmendment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAmendmentDto,
  ) {
    return this.visits.addAmendment(user.id, id, dto.content);
  }
}
