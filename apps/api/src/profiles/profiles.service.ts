import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  // izolacje gabinetow wymusza RLS w bazie, a serwisy dodatkowo zawezaja
  // zapytania do gabinetu i potrzebuja jego id przy tworzeniu rekordow
  async clinicIdFor(userId: string): Promise<string> {
    const db = this.prisma.forUser(userId);
    const profile = await db.profile.findUnique({ where: { id: userId } });
    if (!profile || !profile.active) {
      throw new ForbiddenException('Brak aktywnego profilu terapeuty');
    }
    return profile.clinicId;
  }

  async ownerClinicIdFor(userId: string): Promise<string> {
    const db = this.prisma.forUser(userId);
    const profile = await db.profile.findUnique({ where: { id: userId } });
    if (!profile || !profile.active || profile.role !== 'OWNER') {
      throw new ForbiddenException(
        'Panel jest dostępny tylko dla właściciela gabinetu',
      );
    }
    return profile.clinicId;
  }
}
