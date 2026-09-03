import { healthResponseSchema } from '@splitwiser/shared';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { ApiEnv } from '../errors';

const health = new Hono<ApiEnv>();

const response = async (c: Context<ApiEnv>) => {
  await c.env.DB.prepare('SELECT 1').first();
  return c.json(
    healthResponseSchema.parse({
      status: 'ok',
      service: 'splitwiser-api-production',
      database: 'ok',
    }),
  );
};

health.get('/', response);

export default health;
