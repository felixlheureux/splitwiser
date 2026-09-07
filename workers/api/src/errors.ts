import type { Context } from 'hono';
import { ApiError } from '@splitwiser/shared';
export { ApiError } from '@splitwiser/shared';

export type ApiEnv = {
  Bindings: Env;
  Variables: { requestId: string };
};

export const errorResponse = (c: Context<ApiEnv>, error: ApiError) =>
  new Response(JSON.stringify({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fieldErrors
          ? { fieldErrors: error.fieldErrors }
          : {}),
        requestId: c.get('requestId'),
      },
    }), { status: error.status, headers: { 'Content-Type': 'application/json' } });
