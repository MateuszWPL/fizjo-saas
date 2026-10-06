import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { MailService } from '../mail/mail.service.js';
import type { PatientsService } from '../patients/patients.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { ProfilesService } from '../profiles/profiles.service.js';
import type { StorageService } from '../storage/storage.service.js';
import { ExercisePlansService } from './exercise-plans.service.js';

function setup(exercisesFoundInClinic: number) {
  const db = {
    exercise: { count: vi.fn().mockResolvedValue(exercisesFoundInClinic) },
    exercisePlan: { create: vi.fn().mockResolvedValue({ id: 'plan-1' }) },
  };
  const prisma = { forUser: () => db } as unknown as PrismaService;
  const patients = {
    get: vi.fn().mockResolvedValue({ id: 'patient-1', clinicId: 'clinic-1' }),
  } as unknown as PatientsService;
  const service = new ExercisePlansService(
    prisma,
    {} as ProfilesService,
    patients,
    {} as StorageService,
    {} as MailService,
  );
  return { service, db };
}

describe('ExercisePlansService.create', () => {
  it('odrzuca zestaw z ćwiczeniem spoza bazy gabinetu', async () => {
    const { service, db } = setup(1);

    await expect(
      service.create('user-1', 'patient-1', {
        items: [{ exerciseId: 'ex-1' }, { exerciseId: 'ex-obce' }],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(db.exercisePlan.create).not.toHaveBeenCalled();
  });

  it('zapisuje pozycje w kolejności podanej przez terapeutę', async () => {
    const { service, db } = setup(2);

    await service.create('user-1', 'patient-1', {
      items: [
        { exerciseId: 'ex-2', sets: 3 },
        { exerciseId: 'ex-1', reps: 10 },
      ],
    });

    const data = db.exercisePlan.create.mock.calls[0][0].data;
    expect(data.items.create).toEqual([
      expect.objectContaining({ exerciseId: 'ex-2', position: 0, sets: 3 }),
      expect.objectContaining({ exerciseId: 'ex-1', position: 1, reps: 10 }),
    ]);
  });
});
