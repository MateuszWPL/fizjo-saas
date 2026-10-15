import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { MailModule } from '../mail/mail.module.js';
import { PatientsModule } from '../patients/patients.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ExercisePlansController } from './exercise-plans.controller.js';
import { ExercisePlansService } from './exercise-plans.service.js';

@Module({
  imports: [
    AuditModule,
    PrismaModule,
    ProfilesModule,
    PatientsModule,
    StorageModule,
    MailModule,
  ],
  controllers: [ExercisePlansController],
  providers: [ExercisePlansService],
})
export class ExercisePlansModule {}
