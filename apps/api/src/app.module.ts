import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PatientsModule } from './patients/patients.module.js';

@Module({
  imports: [AuthModule, PatientsModule],
})
export class AppModule {}
