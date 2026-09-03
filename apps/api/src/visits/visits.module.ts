import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { VisitsController } from './visits.controller.js';
import { VisitsService } from './visits.service.js';

@Module({
  imports: [PrismaModule, ProfilesModule, PatientsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
