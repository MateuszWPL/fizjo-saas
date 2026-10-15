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
import { AuditService } from '../audit/audit.service.js';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { VisitsService } from './visits.service.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';
import { UpdateVisitDto } from './dto/update-visit.dto.js';
import { CreateAmendmentDto } from './dto/create-amendment.dto.js';

@Controller()
@UseGuards(AuthGuard)
export class VisitsController {
  constructor(
    private readonly visits: VisitsService,
    private readonly audit: AuditService,
  ) {}

  @Get('patients/:patientId/visits')
  listForPatient(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.visits.listForPatient(user.id, patientId);
  }

  @Post('patients/:patientId/visits')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateVisitDto,
  ) {
    const visit = await this.visits.create(user.id, patientId, dto);
    await this.audit.log(user.id, 'VISIT_CREATED', { patientId });
    return visit;
  }

  @Get('visits/recent')
  recent(@CurrentUser() user: AuthUser) {
    return this.visits.recent(user.id);
  }

  @Get('visits/:id')
  async get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const visit = await this.visits.get(user.id, id);
    await this.audit.log(user.id, 'VISIT_VIEWED', {
      patientId: visit.patientId,
    });
    return visit;
  }

  @Patch('visits/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisitDto,
  ) {
    const visit = await this.visits.update(user.id, id, dto);
    await this.audit.log(user.id, 'VISIT_UPDATED', {
      patientId: visit.patientId,
    });
    return visit;
  }

  @Post('visits/:id/close')
  async close(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const visit = await this.visits.close(user.id, id);
    await this.audit.log(user.id, 'VISIT_CLOSED', {
      patientId: visit.patientId,
    });
    return visit;
  }

  @Post('visits/:id/amendments')
  async addAmendment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAmendmentDto,
  ) {
    const amendment = await this.visits.addAmendment(user.id, id, dto.content);
    await this.audit.log(user.id, 'VISIT_AMENDED', {
      patientId: amendment.visit.patientId,
    });
    return amendment;
  }
}
