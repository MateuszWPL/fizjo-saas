import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VisitsService } from '../visits/visits.service.js';
import type { UpsertBodyMarkerDto } from './dto/upsert-body-marker.dto.js';

@Injectable()
export class BodyMarkersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visits: VisitsService,
  ) {}

  async listForVisit(userId: string, visitId: string) {
    await this.visits.get(userId, visitId);
    return this.prisma.bodyMarker.findMany({
      where: { visitId },
      orderBy: { muscleGroup: 'asc' },
    });
  }

  async upsert(userId: string, visitId: string, muscleGroup: string, dto: UpsertBodyMarkerDto) {
    await this.visits.getOpen(userId, visitId);
    return this.prisma.bodyMarker.upsert({
      where: { visitId_muscleGroup: { visitId, muscleGroup } },
      create: {
        visitId,
        muscleGroup,
        painLevel: dto.painLevel,
        painType: dto.painType,
        note: dto.note,
      },
      update: {
        painLevel: dto.painLevel,
        painType: dto.painType,
        note: dto.note,
      },
    });
  }

  async remove(userId: string, visitId: string, muscleGroup: string) {
    await this.visits.getOpen(userId, visitId);
    const removed = await this.prisma.bodyMarker.deleteMany({
      where: { visitId, muscleGroup },
    });
    if (removed.count === 0) {
      throw new NotFoundException('Nie znaleziono znacznika');
    }
  }
}
