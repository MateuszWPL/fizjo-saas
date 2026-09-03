import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { BodyMarkersModule } from './body-markers/body-markers.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { VisitsModule } from './visits/visits.module.js';

@Module({
  imports: [AuthModule, PatientsModule, VisitsModule, BodyMarkersModule],
})
export class AppModule {}
