import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { PatientsModule } from '../patients/patients.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OutcomesController } from './outcomes.controller.js';
import { OutcomesService } from './outcomes.service.js';

@Module({
  imports: [AuditModule, PrismaModule, PatientsModule],
  controllers: [OutcomesController],
  providers: [OutcomesService],
})
export class OutcomesModule {}
