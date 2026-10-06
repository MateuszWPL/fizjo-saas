import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';
import type { UpdatePatientDto } from './dto/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
  ) {}

  async list(userId: string, search?: string) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    const where: Prisma.PatientWhereInput = { clinicId, archivedAt: null };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    return db.patient.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async get(userId: string, id: string) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    const patient = await db.patient.findFirst({ where: { id, clinicId } });
    if (!patient) {
      throw new NotFoundException('Nie znaleziono pacjenta');
    }
    return patient;
  }

  async create(userId: string, dto: CreatePatientDto) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    return db.patient.create({
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
    const db = this.prisma.forUser(userId);
    const patient = await this.get(userId, id);
    // null czysci pole, undefined (brak pola w requescie) zostawia bez zmian
    let birthDate: Date | null | undefined;
    if (dto.birthDate !== undefined) {
      birthDate = dto.birthDate === null ? null : new Date(dto.birthDate);
    }
    return db.patient.update({
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
    const db = this.prisma.forUser(userId);
    const patient = await this.get(userId, id);
    return db.patient.update({
      where: { id: patient.id },
      data: { archivedAt: new Date() },
    });
  }
}
