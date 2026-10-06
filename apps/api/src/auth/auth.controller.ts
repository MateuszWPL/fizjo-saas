import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthGuard, type AuthUser } from './auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller()
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const db = this.prisma.forUser(user.id);
    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) {
      throw new NotFoundException('Brak profilu terapeuty dla tego konta');
    }
    // nieaktywny uzytkownik widzi w bazie tylko wlasny profil, bez gabinetu,
    // wiec status sprawdzamy przed pobraniem gabinetu
    if (!profile.active) {
      throw new ForbiddenException(
        'Konto zostało dezaktywowane przez właściciela gabinetu',
      );
    }
    const clinic = await db.clinic.findUniqueOrThrow({
      where: { id: profile.clinicId },
    });
    return {
      fullName: profile.fullName,
      role: profile.role,
      clinic: { name: clinic.name },
    };
  }
}
