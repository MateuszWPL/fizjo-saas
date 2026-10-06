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
    const profile = await this.prisma.profile.findUnique({
      where: { id: user.id },
      include: { clinic: true },
    });
    if (!profile) {
      throw new NotFoundException('Brak profilu terapeuty dla tego konta');
    }
    if (!profile.active) {
      throw new ForbiddenException('Konto zostało dezaktywowane przez właściciela gabinetu');
    }
    return {
      fullName: profile.fullName,
      role: profile.role,
      clinic: { name: profile.clinic.name },
    };
  }
}
