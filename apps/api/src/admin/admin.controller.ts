import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AdminService } from './admin.service.js';
import { CreateTherapistDto } from './dto/create-therapist.dto.js';
import { UpdateTherapistDto } from './dto/update-therapist.dto.js';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly audit: AuditService,
  ) {}

  @Get('stats')
  stats(@CurrentUser() user: AuthUser) {
    return this.admin.stats(user.id);
  }

  @Get('therapists')
  listTherapists(@CurrentUser() user: AuthUser) {
    return this.admin.listTherapists(user.id);
  }

  @Post('therapists')
  async createTherapist(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTherapistDto,
  ) {
    const profile = await this.admin.createTherapist(user.id, dto);
    await this.audit.log(user.id, 'THERAPIST_CREATED', {
      details: profile.fullName,
    });
    return profile;
  }

  @Patch('therapists/:id')
  async updateTherapist(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTherapistDto,
  ) {
    const profile = await this.admin.setTherapistActive(
      user.id,
      id,
      dto.active,
    );
    await this.audit.log(
      user.id,
      profile.active ? 'THERAPIST_RESTORED' : 'THERAPIST_DEACTIVATED',
      { details: profile.fullName },
    );
    return profile;
  }
}
