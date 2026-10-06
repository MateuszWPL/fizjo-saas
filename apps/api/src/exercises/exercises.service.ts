import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exercise } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { StorageService } from '../storage/storage.service.js';
import type { CreateExerciseDto } from './dto/create-exercise.dto.js';
import type { UpdateExerciseDto } from './dto/update-exercise.dto.js';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly storage: StorageService,
  ) {}

  private withImageUrl(exercise: Exercise) {
    return {
      ...exercise,
      imageUrl: exercise.imagePath
        ? this.storage.exerciseImageUrl(exercise.imagePath)
        : null,
    };
  }

  async list(userId: string) {
    const clinicId = await this.profiles.clinicIdFor(userId);
    const exercises = await this.prisma.exercise.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    });
    return exercises.map((exercise) => this.withImageUrl(exercise));
  }

  async get(userId: string, id: string) {
    const clinicId = await this.profiles.clinicIdFor(userId);
    const exercise = await this.prisma.exercise.findFirst({
      where: { id, clinicId },
    });
    if (!exercise) {
      throw new NotFoundException('Nie znaleziono ćwiczenia');
    }
    return this.withImageUrl(exercise);
  }

  async create(userId: string, dto: CreateExerciseDto) {
    const clinicId = await this.profiles.clinicIdFor(userId);
    const exercise = await this.prisma.exercise.create({
      data: {
        clinicId,
        name: dto.name,
        description: dto.description,
        defaultSets: dto.defaultSets,
        defaultReps: dto.defaultReps,
      },
    });
    return this.withImageUrl(exercise);
  }

  async update(userId: string, id: string, dto: UpdateExerciseDto) {
    const exercise = await this.get(userId, id);
    const updated = await this.prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        name: dto.name,
        description: dto.description,
        defaultSets: dto.defaultSets,
        defaultReps: dto.defaultReps,
      },
    });
    return this.withImageUrl(updated);
  }

  async remove(userId: string, id: string) {
    const exercise = await this.get(userId, id);
    const usages = await this.prisma.exercisePlanItem.count({
      where: { exerciseId: exercise.id },
    });
    if (usages > 0) {
      throw new ConflictException('Ćwiczenie jest używane w zestawach zaleceń');
    }
    await this.prisma.exercise.delete({ where: { id: exercise.id } });
    if (exercise.imagePath) {
      await this.storage.removeExerciseImage(exercise.imagePath);
    }
  }

  async uploadImage(
    userId: string,
    id: string,
    data: Buffer,
    contentType: string,
  ) {
    const exercise = await this.get(userId, id);
    // stala sciezka bez rozszerzenia, wiec ponowny upload nadpisuje stary plik
    const path = `${exercise.clinicId}/${exercise.id}`;
    await this.storage.uploadExerciseImage(path, data, contentType);
    const updated = await this.prisma.exercise.update({
      where: { id: exercise.id },
      data: { imagePath: path },
    });
    return this.withImageUrl(updated);
  }
}
