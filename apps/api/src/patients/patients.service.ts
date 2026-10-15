import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';
import type { UpdatePatientDto } from './dto/update-patient.dto.js';
import { MUSCLE_GROUP_LABELS } from '../body-markers/muscle-groups.js';
import { outcomeScore } from '../outcomes/outcome-score.js';
import { renderDocumentationPdf } from './documentation-pdf.js';
import { isValidPesel } from './pesel.js';

const sexLabels = { FEMALE: 'kobieta', MALE: 'mężczyzna' } as const;

function checkPesel(pesel: string | null | undefined) {
  if (pesel && !isValidPesel(pesel)) {
    throw new BadRequestException('Nieprawidłowy numer PESEL');
  }
}

// P2002 to blad unikalnosci z Prismy, tu: ten sam PESEL drugi raz w gabinecie
async function rejectDuplicatePesel<T>(query: Promise<T>): Promise<T> {
  try {
    return await query;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Pacjent z tym numerem PESEL już istnieje');
    }
    throw error;
  }
}

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
    checkPesel(dto.pesel);
    return rejectDuplicatePesel(
      db.patient.create({
        data: {
          clinicId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          pesel: dto.pesel,
          sex: dto.sex,
          address: dto.address,
          phone: dto.phone,
          email: dto.email,
          notes: dto.notes,
        },
      }),
    );
  }

  async update(userId: string, id: string, dto: UpdatePatientDto) {
    const db = this.prisma.forUser(userId);
    const patient = await this.get(userId, id);
    // null czysci pole, undefined (brak pola w requescie) zostawia bez zmian
    let birthDate: Date | null | undefined;
    if (dto.birthDate !== undefined) {
      birthDate = dto.birthDate === null ? null : new Date(dto.birthDate);
    }
    checkPesel(dto.pesel);
    return rejectDuplicatePesel(
      db.patient.update({
        where: { id: patient.id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          birthDate,
          pesel: dto.pesel,
          sex: dto.sex,
          address: dto.address,
          phone: dto.phone,
          email: dto.email,
          notes: dto.notes,
        },
      }),
    );
  }

  // kopia calej dokumentacji dla pacjenta, ktory ma do niej prawo wgladu
  async renderDocumentation(userId: string, id: string) {
    const db = this.prisma.forUser(userId);
    const clinicId = await this.profiles.clinicIdFor(userId);
    const [patient, author] = await Promise.all([
      db.patient.findFirst({
        where: { id, clinicId },
        include: {
          clinic: { select: { name: true } },
          outcomeMeasures: {
            orderBy: { createdAt: 'asc' },
            include: { therapist: { select: { fullName: true } } },
          },
          visits: {
            orderBy: [{ visitDate: 'asc' }, { createdAt: 'asc' }],
            include: {
              therapist: { select: { fullName: true, licenseNumber: true } },
              bodyMarkers: { orderBy: { painLevel: 'desc' } },
              amendments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { fullName: true } } },
              },
            },
          },
        },
      }),
      db.profile.findUnique({ where: { id: userId } }),
    ]);
    if (!patient) {
      throw new NotFoundException('Nie znaleziono pacjenta');
    }
    return renderDocumentationPdf({
      clinicName: patient.clinic.name,
      generatedAt: new Date(),
      generatedBy: author?.fullName ?? '-',
      patient: {
        fullName: `${patient.firstName} ${patient.lastName}`,
        pesel: patient.pesel,
        birthDate: patient.birthDate,
        sex: patient.sex ? sexLabels[patient.sex] : null,
        address: patient.address,
        phone: patient.phone,
        email: patient.email,
      },
      outcomes: patient.outcomeMeasures.map((measure) => {
        const score = outcomeScore(measure.type, measure.answers);
        return {
          date: measure.createdAt,
          type: measure.type,
          score: measure.type === 'ODI' ? `${score}%` : `${score}/50 pkt`,
          therapist: measure.therapist.fullName,
        };
      }),
      visits: patient.visits.map((visit) => ({
        visitDate: visit.visitDate,
        closedAt: visit.closedAt,
        therapist: visit.therapist.licenseNumber
          ? `${visit.therapist.fullName}, PWZFz ${visit.therapist.licenseNumber}`
          : visit.therapist.fullName,
        fields: [
          { label: 'Wywiad', value: visit.interview },
          { label: 'Badanie i stan funkcjonalny', value: visit.examination },
          {
            label: 'Rozpoznanie',
            value: visit.icd10Code
              ? `${visit.icd10Code} ${visit.diagnosis ?? ''}`.trim()
              : visit.diagnosis,
          },
          { label: 'Postępowanie fizjoterapeutyczne', value: visit.treatment },
          { label: 'Zalecenia', value: visit.recommendations },
        ],
        markers: visit.bodyMarkers.map((marker) => ({
          muscle: MUSCLE_GROUP_LABELS[marker.muscleGroup] ?? marker.muscleGroup,
          painLevel: marker.painLevel,
          painType: marker.painType,
          note: marker.note,
        })),
        amendments: visit.amendments.map((amendment) => ({
          content: amendment.content,
          author: amendment.author.fullName,
          createdAt: amendment.createdAt,
        })),
      })),
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
