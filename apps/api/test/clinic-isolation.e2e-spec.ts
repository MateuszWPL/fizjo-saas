import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// test dziala na prawdziwej bazie z apps/api/.env: dane przygotowuje jako
// wlasciciel tabel (DATABASE_URL), a sprawdza przez role app_api objeta RLS
process.loadEnvFile();

const owner = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const app = new PrismaService();

const clinicA = randomUUID();
const clinicB = randomUUID();
const userA = randomUUID();
const userB = randomUUID();
const patientA = randomUUID();
const patientB = randomUUID();
const testPatients = { id: { in: [patientA, patientB] } };

describe('izolacja gabinetów przez RLS', () => {
  beforeAll(async () => {
    await owner.clinic.createMany({
      data: [
        { id: clinicA, name: 'Test RLS A' },
        { id: clinicB, name: 'Test RLS B' },
      ],
    });
    await owner.profile.createMany({
      data: [
        { id: userA, clinicId: clinicA, fullName: 'Terapeuta A' },
        { id: userB, clinicId: clinicB, fullName: 'Terapeuta B' },
      ],
    });
    await owner.patient.createMany({
      data: [
        {
          id: patientA,
          clinicId: clinicA,
          firstName: 'Pacjent',
          lastName: 'A',
        },
        {
          id: patientB,
          clinicId: clinicB,
          firstName: 'Pacjent',
          lastName: 'B',
        },
      ],
    });
  });

  afterAll(async () => {
    await owner.patient.deleteMany({ where: testPatients });
    await owner.profile.deleteMany({ where: { id: { in: [userA, userB] } } });
    await owner.clinic.deleteMany({
      where: { id: { in: [clinicA, clinicB] } },
    });
    await owner.$disconnect();
    await app.$disconnect();
  });

  it('terapeuta widzi tylko pacjentów swojego gabinetu', async () => {
    const patients = await app
      .forUser(userA)
      .patient.findMany({ where: testPatients });

    expect(patients.map((patient) => patient.id)).toEqual([patientA]);
  });

  it('zapytanie bez użytkownika nie zwraca żadnych danych', async () => {
    const patients = await app.patient.findMany({ where: testPatients });

    expect(patients).toEqual([]);
  });

  it('nie da się zmienić pacjenta z innego gabinetu', async () => {
    const result = await app.forUser(userA).patient.updateMany({
      where: { id: patientB },
      data: { notes: 'zmiana z gabinetu A' },
    });

    expect(result.count).toBe(0);
    const untouched = await owner.patient.findUnique({
      where: { id: patientB },
    });
    expect(untouched?.notes).toBeNull();
  });

  it('nie da się dodać pacjenta do innego gabinetu', async () => {
    await expect(
      app.forUser(userA).patient.create({
        data: { clinicId: clinicB, firstName: 'Intruz', lastName: 'X' },
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it('dezaktywowany terapeuta traci dostęp do danych gabinetu', async () => {
    await owner.profile.update({
      where: { id: userA },
      data: { active: false },
    });

    const patients = await app
      .forUser(userA)
      .patient.findMany({ where: testPatients });

    expect(patients).toEqual([]);
  });
});
