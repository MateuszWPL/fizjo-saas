import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';

@Module({
  imports: [PrismaModule, ProfilesModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
