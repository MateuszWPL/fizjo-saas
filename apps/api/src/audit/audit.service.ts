import { Injectable } from '@nestjs/common';
import type { AuditAction } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    target: { patientId?: string; details?: string } = {},
  ) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    await db.auditEvent.create({
      data: {
        clinicId,
        actorId: userId,
        action,
        patientId: target.patientId,
        details: target.details,
      },
    });
  }

  // dziennik oglada tylko wlasciciel, pokazujemy ostatnie wpisy bez stronicowania
  async list(userId: string) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.ownerClinicIdFor(userId);
    return db.auditEvent.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
        actor: { select: { fullName: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
