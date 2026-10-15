import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { PatientsModule } from '../patients/patients.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { VisitsController } from './visits.controller.js';
import { VisitsService } from './visits.service.js';

@Module({
  imports: [AuditModule, PrismaModule, ProfilesModule, PatientsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
