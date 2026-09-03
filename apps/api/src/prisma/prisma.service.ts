import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('Brak DATABASE_URL w apps/api/.env');
    }
    super({ adapter: new PrismaPg({ connectionString: url }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
