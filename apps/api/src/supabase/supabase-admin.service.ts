import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// klient z kluczem sekretnym, omija RLS i ma dostep do Auth Admin API,
// wiec uzywamy go tylko po stronie API
@Injectable()
export class SupabaseAdminService {
  private client: SupabaseClient | null = null;

  // klient tworzony leniwie, zeby brak klucza w .env wywracal dopiero
  // konkretna operacje, a nie start calej aplikacji
  getClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SECRET_KEY;
      if (!url || !key) {
        throw new Error(
          'Brak SUPABASE_URL lub SUPABASE_SECRET_KEY w apps/api/.env',
        );
      }
      this.client = createClient(url, key);
    }
    return this.client;
  }
}
