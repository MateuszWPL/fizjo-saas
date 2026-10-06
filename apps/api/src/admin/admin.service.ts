import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { SupabaseAdminService } from '../supabase/supabase-admin.service.js';
import type { CreateTherapistDto } from './dto/create-therapist.dto.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly supabase: SupabaseAdminService,
  ) {}

  async stats(userId: string) {
    const clinicId = await this.profiles.ownerClinicIdFor(userId);
    const now = new Date();
    // visit_date to kolumna DATE bez strefy, wiec granice miesiaca liczymy w UTC,
    // inaczej polnoc czasu polskiego przesunelaby zakres o dzien wstecz
    const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const nextMonthStart = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 1),
    );
    const [patients, visitsThisMonth] = await Promise.all([
      this.prisma.patient.count({ where: { clinicId, archivedAt: null } }),
      this.prisma.visit.count({
        where: {
          patient: { clinicId },
          visitDate: { gte: monthStart, lt: nextMonthStart },
        },
      }),
    ]);
    return { patients, visitsThisMonth };
  }

  async listTherapists(userId: string) {
    const clinicId = await this.profiles.ownerClinicIdFor(userId);
    const profiles = await this.prisma.profile.findMany({
      where: { clinicId },
      orderBy: { fullName: 'asc' },
    });
    // e-mail zyje w Supabase Auth, nie w naszej tabeli profiles
    return Promise.all(
      profiles.map(async (profile) => {
        const { data, error } = await this.supabase
          .getClient()
          .auth.admin.getUserById(profile.id);
        if (error) {
          throw new InternalServerErrorException(
            'Nie udało się pobrać adresów e-mail terapeutów',
          );
        }
        return {
          id: profile.id,
          fullName: profile.fullName,
          role: profile.role,
          active: profile.active,
          email: data.user.email ?? null,
        };
      }),
    );
  }

  async createTherapist(userId: string, dto: CreateTherapistDto) {
    const clinicId = await this.profiles.ownerClinicIdFor(userId);
    const auth = this.supabase.getClient().auth.admin;
    const { data, error } = await auth.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });
    if (error) {
      if (error.code === 'email_exists') {
        throw new ConflictException('Konto z tym adresem e-mail już istnieje');
      }
      throw new BadRequestException(
        `Nie udało się założyć konta: ${error.message}`,
      );
    }
    try {
      return await this.prisma.profile.create({
        data: {
          id: data.user.id,
          clinicId,
          fullName: dto.fullName,
          role: 'THERAPIST',
        },
      });
    } catch (profileError) {
      // bez profilu konto w Auth byloby bezuzyteczne, wiec je cofamy
      const { error: deleteError } = await auth.deleteUser(data.user.id);
      if (deleteError) {
        throw new InternalServerErrorException(
          `Nie zapisano profilu, a konto ${dto.email} trzeba usunąć ręcznie w Supabase`,
        );
      }
      throw profileError;
    }
  }

  async setTherapistActive(
    userId: string,
    therapistId: string,
    active: boolean,
  ) {
    const clinicId = await this.profiles.ownerClinicIdFor(userId);
    if (therapistId === userId) {
      throw new BadRequestException('Nie można zmienić statusu własnego konta');
    }
    const profile = await this.prisma.profile.findFirst({
      where: { id: therapistId, clinicId },
    });
    if (!profile) {
      throw new NotFoundException('Nie znaleziono terapeuty');
    }
    return this.prisma.profile.update({
      where: { id: profile.id },
      data: { active },
    });
  }
}
