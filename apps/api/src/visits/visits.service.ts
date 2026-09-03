import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { CreateVisitDto } from './dto/create-visit.dto.js';
import type { UpdateVisitDto } from './dto/update-visit.dto.js';

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly patients: PatientsService,
  ) {}

  async listForPatient(userId: string, patientId: string) {
    const patient = await this.patients.get(userId, patientId);
    return this.prisma.visit.findMany({
      where: { patientId: patient.id },
      orderBy: { visitDate: 'desc' },
      include: { therapist: { select: { fullName: true } } },
    });
  }

  async create(userId: string, patientId: string, dto: CreateVisitDto) {
    const patient = await this.patients.get(userId, patientId);
    return this.prisma.visit.create({
      data: {
        patientId: patient.id,
        therapistId: userId,
        visitDate: new Date(dto.visitDate),
        interview: dto.interview,
        examination: dto.examination,
        diagnosis: dto.diagnosis,
        recommendations: dto.recommendations,
      },
    });
  }

  async get(userId: string, id: string) {
    const clinicId = await this.profiles.clinicIdFor(userId);
    const visit = await this.prisma.visit.findFirst({
      where: { id, patient: { clinicId } },
      include: {
        therapist: { select: { fullName: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!visit) {
      throw new NotFoundException('Nie znaleziono wizyty');
    }
    return visit;
  }

  async update(userId: string, id: string, dto: UpdateVisitDto) {
    const visit = await this.get(userId, id);
    if (visit.closedAt) {
      throw new ConflictException('Zamknięta wizyta jest niemodyfikowalna');
    }
    return this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
        interview: dto.interview,
        examination: dto.examination,
        diagnosis: dto.diagnosis,
        recommendations: dto.recommendations,
      },
    });
  }

  async close(userId: string, id: string) {
    const visit = await this.get(userId, id);
    if (visit.closedAt) {
      throw new ConflictException('Wizyta jest już zamknięta');
    }
    return this.prisma.visit.update({
      where: { id: visit.id },
      data: { closedAt: new Date() },
    });
  }
}
