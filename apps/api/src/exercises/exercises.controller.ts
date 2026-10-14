import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, type AuthUser } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ExercisesService } from './exercises.service.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';

@Controller('exercises')
@UseGuards(AuthGuard)
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.exercises.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.exercises.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateExerciseDto) {
    return this.exercises.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exercises.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercises.remove(user.id, id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.exercises.uploadImage(user.id, id, file.buffer, file.mimetype);
  }
}
