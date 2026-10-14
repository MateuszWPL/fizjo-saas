import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PatientsService } from '../patients/patients.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { VisitsService } from '../visits/visits.service.js';
import { BodyMarkersService } from './body-markers.service.js';

function setup() {
  const db = { bodyMarker: { upsert: vi.fn().mockResolvedValue({}) } };
  const prisma = { forUser: () => db } as unknown as PrismaService;
  const visits = {
    getOpen: vi.fn().mockResolvedValue({ id: 'visit-1' }),
  } as unknown as VisitsService;
  const service = new BodyMarkersService(prisma, visits, {} as PatientsService);
  return { service, db };
}

describe('BodyMarkersService.upsert', () => {
  it('odrzuca kod mięśnia, którego nie ma na mapie ciała', async () => {
    const { service, db } = setup();

    await expect(
      service.upsert('user-1', 'visit-1', 'ucho-l', { painLevel: 5 }),
    ).rejects.toThrow(BadRequestException);
    expect(db.bodyMarker.upsert).not.toHaveBeenCalled();
  });

  it('zapisuje znacznik dla znanej grupy mięśniowej', async () => {
    const { service, db } = setup();

    await service.upsert('user-1', 'visit-1', 'kolano-p', { painLevel: 5 });

    expect(db.bodyMarker.upsert).toHaveBeenCalled();
  });
});
