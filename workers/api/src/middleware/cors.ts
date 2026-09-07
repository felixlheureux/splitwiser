import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import type { ApiEnv } from '../errors';

export const corsMiddleware: MiddlewareHandler<ApiEnv> = cors({
  origin: (origin, c) => {
    if (!origin) return undefined;
    if (
      origin === c.env.APP_ORIGIN ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('.splitwiser.app') ||
      origin.startsWith('http://localhost:')
    ) {
      return origin;
    }
    return undefined;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Idempotency-Key', 'If-Match'],
  exposeHeaders: ['ETag', 'Retry-After'],
});
