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
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AdminService } from './admin.service.js';
import { CreateTherapistDto } from './dto/create-therapist.dto.js';
import { UpdateTherapistDto } from './dto/update-therapist.dto.js';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats(@CurrentUser() user: AuthUser) {
    return this.admin.stats(user.id);
  }

  @Get('therapists')
  listTherapists(@CurrentUser() user: AuthUser) {
    return this.admin.listTherapists(user.id);
  }

  @Post('therapists')
  createTherapist(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTherapistDto,
  ) {
    return this.admin.createTherapist(user.id, dto);
  }

  @Patch('therapists/:id')
  updateTherapist(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTherapistDto,
  ) {
    return this.admin.setTherapistActive(user.id, id, dto.active);
  }
}
