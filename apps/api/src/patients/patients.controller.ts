import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

@Controller('patients')
@UseGuards(AuthGuard)
export class PatientsController {
  constructor(
    private readonly patients: PatientsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('search') search?: string) {
    return this.patients.list(user.id, search);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const patient = await this.patients.get(user.id, id);
    await this.audit.log(user.id, 'PATIENT_VIEWED', { patientId: patient.id });
    return patient;
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreatePatientDto) {
    const patient = await this.patients.create(user.id, dto);
    await this.audit.log(user.id, 'PATIENT_CREATED', { patientId: patient.id });
    return patient;
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    const patient = await this.patients.update(user.id, id, dto);
    await this.audit.log(user.id, 'PATIENT_UPDATED', { patientId: patient.id });
    return patient;
  }

  @Post(':id/archive')
  async archive(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const patient = await this.patients.archive(user.id, id);
    await this.audit.log(user.id, 'PATIENT_ARCHIVED', {
      patientId: patient.id,
    });
    return patient;
  }
}
