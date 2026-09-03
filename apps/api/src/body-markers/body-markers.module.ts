import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VisitsModule } from '../visits/visits.module.js';
import { BodyMarkersController } from './body-markers.controller.js';
import { BodyMarkersService } from './body-markers.service.js';
import { PainHistoryController } from './pain-history.controller.js';

@Module({
  imports: [PrismaModule, VisitsModule, PatientsModule],
  controllers: [BodyMarkersController, PainHistoryController],
  providers: [BodyMarkersService],
})
export class BodyMarkersModule {}
