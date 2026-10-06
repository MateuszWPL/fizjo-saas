import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// API laczy sie jako rola app_api, ktora obejmuja polityki RLS.
// Migracje ida osobno, jako wlasciciel tabel, przez DATABASE_URL w prisma.config.ts.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const url = process.env.APP_DATABASE_URL;
    if (!url) {
      throw new Error('Brak APP_DATABASE_URL w apps/api/.env');
    }
    super({ adapter: new PrismaPg({ connectionString: url }) });
  }

  // polityki RLS wyliczaja gabinet z app.user_id, a true w set_config
  // ogranicza zmienna do tej jednej transakcji
  forUser(userId: string) {
    return this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ args, query }) => {
            const [, result] = await this.$transaction([
              this
                .$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
