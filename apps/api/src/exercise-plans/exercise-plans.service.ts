import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';
import { PatientsService } from '../patients/patients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { StorageService } from '../storage/storage.service.js';
import type { CreateExercisePlanDto } from './dto/create-exercise-plan.dto.js';
import { renderPlanPdf, type PlanPdfData } from './plan-pdf.js';

@Injectable()
export class ExercisePlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly patients: PatientsService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
  ) {}

  async listForPatient(userId: string, patientId: string) {
    const db = this.prisma.forUser(userId);
    const patient = await this.patients.get(userId, patientId);
    return db.exercisePlan.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        therapist: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async create(userId: string, patientId: string, dto: CreateExercisePlanDto) {
    const db = this.prisma.forUser(userId);
    const patient = await this.patients.get(userId, patientId);
    const exerciseIds = [...new Set(dto.items.map((item) => item.exerciseId))];
    const found = await db.exercise.count({
      where: { id: { in: exerciseIds }, clinicId: patient.clinicId },
    });
    if (found !== exerciseIds.length) {
      throw new BadRequestException(
        'Zestaw zawiera ćwiczenie spoza bazy gabinetu',
      );
    }
    return db.exercisePlan.create({
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
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    const plan = await db.exercisePlan.findFirst({
      where: { id, patient: { clinicId } },
      include: {
        therapist: { select: { fullName: true } },
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
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

  async renderPdf(userId: string, id: string) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    const plan = await db.exercisePlan.findFirst({
      where: { id, patient: { clinicId } },
      include: {
        therapist: { select: { fullName: true } },
        patient: { include: { clinic: { select: { name: true } } } },
        items: { orderBy: { position: 'asc' }, include: { exercise: true } },
      },
    });
    if (!plan) {
      throw new NotFoundException('Nie znaleziono zestawu zaleceń');
    }
    const items: PlanPdfData['items'] = [];
    for (const item of plan.items) {
      const image = item.exercise.imagePath
        ? await this.storage.downloadExerciseImage(item.exercise.imagePath)
        : null;
      items.push({
        name: item.exercise.name,
        description: item.exercise.description,
        sets: item.sets,
        reps: item.reps,
        note: item.note,
        // pdfkit obsluguje tylko JPEG i PNG, obrazki WebP pomijamy w PDF
        image:
          image && ['image/jpeg', 'image/png'].includes(image.type)
            ? image.data
            : null,
      });
    }
    return renderPlanPdf({
      clinicName: plan.patient.clinic.name,
      patientName: `${plan.patient.firstName} ${plan.patient.lastName}`,
      therapistName: plan.therapist.fullName,
      issuedAt: plan.createdAt,
      note: plan.note,
      items,
    });
  }

  async sendByEmail(userId: string, id: string) {
    const plan = await this.get(userId, id);
    if (!plan.patient.email) {
      throw new BadRequestException('Pacjent nie ma adresu e-mail');
    }
    const pdf = await this.renderPdf(userId, id);
    await this.mail.sendWithPdf(
      plan.patient.email,
      'Zalecenia ćwiczeń',
      `Dzień dobry,\n\nw załączniku przesyłamy zestaw zaleceń ćwiczeń z dnia ${plan.createdAt.toLocaleDateString('pl-PL')}.\n\n${plan.therapist.fullName}`,
      'zalecenia.pdf',
      pdf,
    );
    return { sentTo: plan.patient.email };
  }

  async remove(userId: string, id: string) {
    const db = this.prisma.forUser(userId);
    const plan = await this.get(userId, id);
    await db.exercisePlan.delete({ where: { id: plan.id } });
  }
}
