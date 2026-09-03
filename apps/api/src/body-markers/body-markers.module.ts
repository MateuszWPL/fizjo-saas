import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VisitsModule } from '../visits/visits.module.js';
import { BodyMarkersController } from './body-markers.controller.js';
import { BodyMarkersService } from './body-markers.service.js';

@Module({
  imports: [PrismaModule, VisitsModule],
  controllers: [BodyMarkersController],
  providers: [BodyMarkersService],
})
export class BodyMarkersModule {}
