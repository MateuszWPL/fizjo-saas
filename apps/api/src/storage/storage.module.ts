import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { StorageService } from './storage.service.js';

@Module({
  imports: [SupabaseModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
