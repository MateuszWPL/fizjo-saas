import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { CreateExercisePlanDto } from './dto/create-exercise-plan.dto.js';

@Injectable()
export class ExercisePlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly patients: PatientsService,
  ) {}

  async listForPatient(userId: string, patientId: string) {
    const patient = await this.patients.get(userId, patientId);
    return this.prisma.exercisePlan.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        therapist: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async create(userId: string, patientId: string, dto: CreateExercisePlanDto) {
    const patient = await this.patients.get(userId, patientId);
    const exerciseIds = [...new Set(dto.items.map((item) => item.exerciseId))];
    const found = await this.prisma.exercise.count({
      where: { id: { in: exerciseIds }, clinicId: patient.clinicId },
    });
    if (found !== exerciseIds.length) {
      throw new BadRequestException('Zestaw zawiera ćwiczenie spoza bazy gabinetu');
    }
    return this.prisma.exercisePlan.create({
      data: {
        patientId: patient.id,
        therapistId: userId,
        note: dto.note,
        items: {
          create: dto.items.map((item, index) => ({
            exerciseId: item.exerciseId,
            position: index,
            sets: item.sets,
            reps: item.reps,
            note: item.note,
          })),
        },
      },
    });
  }

  async get(userId: string, id: string) {
    const clinicId = await this.profiles.clinicIdFor(userId);
    const plan = await this.prisma.exercisePlan.findFirst({
      where: { id, patient: { clinicId } },
      include: {
        therapist: { select: { fullName: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
        items: {
          orderBy: { position: 'asc' },
          include: { exercise: { select: { name: true, description: true } } },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('Nie znaleziono zestawu zaleceń');
    }
    return plan;
  }

  async remove(userId: string, id: string) {
    const plan = await this.get(userId, id);
    await this.prisma.exercisePlan.delete({ where: { id: plan.id } });
  }
}
