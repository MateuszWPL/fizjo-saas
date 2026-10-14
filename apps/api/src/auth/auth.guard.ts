import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string | null;
}

// Supabase podpisuje JWT asymetrycznie (ES256), wiec weryfikacja idzie
// po publicznym JWKS i nie wymaga zadnego sekretu po stronie API
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly issuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Brak SUPABASE_URL w apps/api/.env');
    }
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    let payload;
    try {
      ({ payload } = await jwtVerify(
        header.slice('Bearer '.length),
        this.jwks,
        {
          issuer: this.issuer,
        },
      ));
    } catch {
      throw new UnauthorizedException();
    }
    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedException();
    }
    request.user = {
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : null,
    };
    return true;
  }
}
