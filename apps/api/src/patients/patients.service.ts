import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';
import type { UpdatePatientDto } from './dto/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  // izolacja gabinetow: kazde zapytanie jest zawezane do gabinetu
  // zalogowanego terapeuty, docelowo dojdzie do tego RLS w bazie
  private async clinicIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile || !profile.active) {
      throw new ForbiddenException('Brak aktywnego profilu terapeuty');
    }
    return profile.clinicId;
  }

  async list(userId: string, search?: string) {
    const clinicId = await this.clinicIdFor(userId);
    const where: Prisma.PatientWhereInput = { clinicId, archivedAt: null };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.patient.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async get(userId: string, id: string) {
    const clinicId = await this.clinicIdFor(userId);
    const patient = await this.prisma.patient.findFirst({ where: { id, clinicId } });
    if (!patient) {
      throw new NotFoundException('Nie znaleziono pacjenta');
    }
    return patient;
  }

  async create(userId: string, dto: CreatePatientDto) {
    const clinicId = await this.clinicIdFor(userId);
    return this.prisma.patient.create({
      data: {
        clinicId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdatePatientDto) {
    const patient = await this.get(userId, id);
    // null czysci pole, undefined (brak pola w requescie) zostawia bez zmian
    let birthDate: Date | null | undefined;
    if (dto.birthDate !== undefined) {
      birthDate = dto.birthDate === null ? null : new Date(dto.birthDate);
    }
    return this.prisma.patient.update({
      where: { id: patient.id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
      },
    });
  }

  async archive(userId: string, id: string) {
    const patient = await this.get(userId, id);
    return this.prisma.patient.update({
      where: { id: patient.id },
      data: { archivedAt: new Date() },
    });
  }
}
