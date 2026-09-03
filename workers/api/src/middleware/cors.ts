import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import type { ApiEnv } from '../errors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://dash.splitwiser.app',
];

export const corsMiddleware: MiddlewareHandler<ApiEnv> = cors({
  origin: (origin) =>
    allowedOrigins.includes(origin) ? origin : undefined,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Idempotency-Key', 'If-Match'],
  exposeHeaders: ['ETag', 'Retry-After'],
});
