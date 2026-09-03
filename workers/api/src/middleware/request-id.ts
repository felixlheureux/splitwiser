import type { MiddlewareHandler } from 'hono';
import type { ApiEnv } from '../errors';

export const requestIdMiddleware: MiddlewareHandler<ApiEnv> = async (
  c,
  next,
) => {
  c.set('requestId', crypto.randomUUID());
  await next();
  c.header('X-Request-ID', c.get('requestId'));
};
