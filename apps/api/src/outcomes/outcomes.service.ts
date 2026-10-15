import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateOutcomeDto } from './dto/create-outcome.dto.js';
import { outcomeScore } from './outcome-score.js';

@Injectable()
export class OutcomesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patients: PatientsService,
  ) {}

  async listForPatient(userId: string, patientId: string) {
    const db = this.prisma.forUser(userId);
    const patient = await this.patients.get(userId, patientId);
    const measures = await db.outcomeMeasure.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'asc' },
      include: { therapist: { select: { fullName: true } } },
    });
    return measures.map((measure) => ({
      ...measure,
      score: outcomeScore(measure.type, measure.answers),
    }));
  }

  async create(userId: string, patientId: string, dto: CreateOutcomeDto) {
    const db = this.prisma.forUser(userId);
    const patient = await this.patients.get(userId, patientId);
    const measure = await db.outcomeMeasure.create({
      data: {
        patientId: patient.id,
        therapistId: userId,
        type: dto.type,
        answers: dto.answers,
      },
    });
    return { ...measure, score: outcomeScore(measure.type, measure.answers) };
  }
}
