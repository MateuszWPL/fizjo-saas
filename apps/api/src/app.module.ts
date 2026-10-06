import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { BodyMarkersModule } from './body-markers/body-markers.module.js';
import { ExercisePlansModule } from './exercise-plans/exercise-plans.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { VisitsModule } from './visits/visits.module.js';

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    VisitsModule,
    BodyMarkersModule,
    ExercisesModule,
    ExercisePlansModule,
  ],
})
export class AppModule {}
