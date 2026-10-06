import { BadRequestException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { ProfilesService } from '../profiles/profiles.service.js';
import type { SupabaseAdminService } from '../supabase/supabase-admin.service.js';
import { AdminService } from './admin.service.js';

function setup() {
  const db = {
    patient: { count: vi.fn().mockResolvedValue(5) },
    visit: { count: vi.fn().mockResolvedValue(2) },
    profile: { findFirst: vi.fn(), update: vi.fn() },
  };
  const prisma = { forUser: () => db } as unknown as PrismaService;
  const profiles = {
    ownerClinicIdFor: vi.fn().mockResolvedValue('clinic-1'),
  } as unknown as ProfilesService;
  const service = new AdminService(
    prisma,
    profiles,
    {} as SupabaseAdminService,
  );
  return { service, db };
}

describe('AdminService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('liczy wizyty od pierwszego dnia bieżącego miesiąca', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 15, 12));
    const { service, db } = setup();

    const stats = await service.stats('owner-1');

    expect(stats).toEqual({ patients: 5, visitsThisMonth: 2 });
    const range = db.visit.count.mock.calls[0][0].where.visitDate;
    expect(range.gte.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(range.lt.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  it('w grudniu kończy zakres na początku stycznia następnego roku', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 20, 12));
    const { service, db } = setup();

    await service.stats('owner-1');

    const range = db.visit.count.mock.calls[0][0].where.visitDate;
    expect(range.gte.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(range.lt.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('nie pozwala właścicielowi zmienić statusu własnego konta', async () => {
    const { service, db } = setup();

    await expect(
      service.setTherapistActive('owner-1', 'owner-1', false),
    ).rejects.toThrow(BadRequestException);
    expect(db.profile.update).not.toHaveBeenCalled();
  });
});
