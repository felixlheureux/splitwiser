import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import type { ApiEnv } from '../errors';

export const corsMiddleware: MiddlewareHandler<ApiEnv> = cors({
  origin: (origin, c) => origin === c.env.APP_ORIGIN ? origin : undefined,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Idempotency-Key', 'If-Match'],
  exposeHeaders: ['ETag', 'Retry-After'],
});
