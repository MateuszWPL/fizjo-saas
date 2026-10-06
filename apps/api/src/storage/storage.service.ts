import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseAdminService } from '../supabase/supabase-admin.service.js';

const BUCKET = 'exercises';

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseAdminService) {}

  async uploadExerciseImage(path: string, data: Buffer, contentType: string) {
    const { error } = await this.supabase
      .getClient()
      .storage.from(BUCKET)
      .upload(path, data, { contentType, upsert: true });
    if (error) {
      throw new InternalServerErrorException('Nie udało się zapisać pliku');
    }
  }

  // osierocony plik w bucketcie nie szkodzi, wiec wynik usuwania ignorujemy
  async removeExerciseImage(path: string) {
    await this.supabase.getClient().storage.from(BUCKET).remove([path]);
  }

  // brak obrazka nie powinien blokowac wydania zalecen, cwiczenie trafi do PDF bez niego
  async downloadExerciseImage(path: string) {
    const { data, error } = await this.supabase.getClient().storage.from(BUCKET).download(path);
    if (error) {
      return null;
    }
    return { data: Buffer.from(await data.arrayBuffer()), type: data.type };
  }

  exerciseImageUrl(path: string): string {
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  }
}
