import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  // izolacja gabinetow: kazde zapytanie jest zawezane do gabinetu
  // zalogowanego terapeuty, docelowo dojdzie do tego RLS w bazie
  async clinicIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile || !profile.active) {
      throw new ForbiddenException('Brak aktywnego profilu terapeuty');
    }
    return profile.clinicId;
  }

  async ownerClinicIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile || !profile.active || profile.role !== 'OWNER') {
      throw new ForbiddenException(
        'Panel jest dostępny tylko dla właściciela gabinetu',
      );
    }
    return profile.clinicId;
  }
}
