import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfilesService } from './profiles.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
