import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ExercisePlansService } from './exercise-plans.service.js';
import { CreateExercisePlanDto } from './dto/create-exercise-plan.dto.js';

@Controller()
@UseGuards(AuthGuard)
export class ExercisePlansController {
  constructor(private readonly plans: ExercisePlansService) {}

  @Get('patients/:patientId/plans')
  listForPatient(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.plans.listForPatient(user.id, patientId);
  }

  @Post('patients/:patientId/plans')
  create(
    @CurrentUser() user: AuthUser,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateExercisePlanDto,
  ) {
    return this.plans.create(user.id, patientId, dto);
  }

  @Get('plans/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plans.get(user.id, id);
  }

  @Delete('plans/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plans.remove(user.id, id);
  }
}
