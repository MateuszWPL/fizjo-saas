import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ExercisePlansService } from './exercise-plans.service.js';
import { CreateExercisePlanDto } from './dto/create-exercise-plan.dto.js';

@Controller()
@UseGuards(AuthGuard)
export class ExercisePlansController {
  constructor(
    private readonly plans: ExercisePlansService,
    private readonly audit: AuditService,
  ) {}

  @Get('patients/:patientId/plans')
  listForPatient(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.plans.listForPatient(user.id, patientId);
  }

  @Post('patients/:patientId/plans')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateExercisePlanDto,
  ) {
    const plan = await this.plans.create(user.id, patientId, dto);
    await this.audit.log(user.id, 'PLAN_CREATED', { patientId });
    return plan;
  }

  @Get('plans/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plans.get(user.id, id);
  }

  @Get('plans/:id/pdf')
  async pdf(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const plan = await this.plans.get(user.id, id);
    const pdf = await this.plans.renderPdf(user.id, id);
    await this.audit.log(user.id, 'PLAN_PDF_DOWNLOADED', {
      patientId: plan.patient.id,
    });
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: 'attachment; filename="zalecenia.pdf"',
    });
  }

  @Post('plans/:id/send')
  async send(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const plan = await this.plans.get(user.id, id);
    const result = await this.plans.sendByEmail(user.id, id);
    await this.audit.log(user.id, 'PLAN_EMAILED', {
      patientId: plan.patient.id,
      details: result.sentTo,
    });
    return result;
  }

  @Delete('plans/:id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.plans.remove(user.id, id);
  }
}
