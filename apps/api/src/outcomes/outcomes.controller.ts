import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateOutcomeDto } from './dto/create-outcome.dto.js';
import { OutcomesService } from './outcomes.service.js';

@Controller('patients/:patientId/outcomes')
@UseGuards(AuthGuard)
export class OutcomesController {
  constructor(
    private readonly outcomes: OutcomesService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.outcomes.listForPatient(user.id, patientId);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateOutcomeDto,
  ) {
    const measure = await this.outcomes.create(user.id, patientId, dto);
    await this.audit.log(user.id, 'OUTCOME_RECORDED', {
      patientId,
      details: dto.type,
    });
    return measure;
  }
}
