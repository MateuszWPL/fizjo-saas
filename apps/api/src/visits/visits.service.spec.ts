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
    visitAmendment: { create: vi.fn().mockResolvedValue({}) },
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

  it('dopisuje adnotację do zamkniętej wizyty z autorem', async () => {
    const { service, db } = setup(new Date('2026-10-01'));

    await service.addAmendment('user-1', 'visit-1', 'Korekta rozpoznania');

    expect(db.visitAmendment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          visitId: 'visit-1',
          authorId: 'user-1',
          content: 'Korekta rozpoznania',
        },
      }),
    );
  });

  it('nie dopisuje adnotacji do otwartej wizyty', async () => {
    const { service, db } = setup(null);

    await expect(
      service.addAmendment('user-1', 'visit-1', 'Korekta'),
    ).rejects.toThrow(ConflictException);
    expect(db.visitAmendment.create).not.toHaveBeenCalled();
  });
});
