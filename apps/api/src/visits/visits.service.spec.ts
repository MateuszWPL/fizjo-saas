import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PatientsService } from '../patients/patients.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { ProfilesService } from '../profiles/profiles.service.js';
import { VisitsService } from './visits.service.js';

function setup(closedAt: Date | null) {
  const visit = { id: 'visit-1', closedAt };
  const db = {
    visit: {
      findFirst: vi.fn().mockResolvedValue(visit),
      update: vi.fn().mockResolvedValue(visit),
    },
  };
  const prisma = { forUser: () => db } as unknown as PrismaService;
  const profiles = {
    clinicIdFor: vi.fn().mockResolvedValue('clinic-1'),
  } as unknown as ProfilesService;
  const service = new VisitsService(prisma, profiles, {} as PatientsService);
  return { service, db };
}

describe('VisitsService', () => {
  it('nie pozwala edytować zamkniętej wizyty', async () => {
    const { service, db } = setup(new Date('2026-10-01'));

    await expect(
      service.update('user-1', 'visit-1', { diagnosis: 'zmiana' }),
    ).rejects.toThrow(ConflictException);
    expect(db.visit.update).not.toHaveBeenCalled();
  });

  it('zapisuje zmiany w otwartej wizycie', async () => {
    const { service, db } = setup(null);

    await service.update('user-1', 'visit-1', { diagnosis: 'zmiana' });

    expect(db.visit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'visit-1' },
        data: expect.objectContaining({ diagnosis: 'zmiana' }),
      }),
    );
  });

  it('nie zamyka drugi raz już zamkniętej wizyty', async () => {
    const { service, db } = setup(new Date('2026-10-01'));

    await expect(service.close('user-1', 'visit-1')).rejects.toThrow(
      ConflictException,
    );
    expect(db.visit.update).not.toHaveBeenCalled();
  });
});
