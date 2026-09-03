import type { Context } from 'hono';
import { ApiError, type ApiEnv } from '../errors';
import { createAuth } from './index';

export const requireUser = async (c: Context<ApiEnv>) => {
  const session = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new ApiError(
      'auth_required',
      'A valid session is required.',
      401,
    );
  }

  return session.user;
};
