import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'exercises';

@Injectable()
export class StorageService {
  private client: SupabaseClient | null = null;

  // klient tworzony leniwie, zeby brak klucza w .env wywracal dopiero upload,
  // a nie start calej aplikacji
  private getClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SECRET_KEY;
      if (!url || !key) {
        throw new Error('Brak SUPABASE_URL lub SUPABASE_SECRET_KEY w apps/api/.env');
      }
      this.client = createClient(url, key);
    }
    return this.client;
  }

  async uploadExerciseImage(path: string, data: Buffer, contentType: string) {
    const { error } = await this.getClient()
      .storage.from(BUCKET)
      .upload(path, data, { contentType, upsert: true });
    if (error) {
      throw new InternalServerErrorException('Nie udało się zapisać pliku');
    }
  }

  // osierocony plik w bucketcie nie szkodzi, wiec wynik usuwania ignorujemy
  async removeExerciseImage(path: string) {
    await this.getClient().storage.from(BUCKET).remove([path]);
  }

  // brak obrazka nie powinien blokowac wydania zalecen, cwiczenie trafi do PDF bez niego
  async downloadExerciseImage(path: string) {
    const { data, error } = await this.getClient().storage.from(BUCKET).download(path);
    if (error) {
      return null;
    }
    return { data: Buffer.from(await data.arrayBuffer()), type: data.type };
  }

  exerciseImageUrl(path: string): string {
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  }
}
