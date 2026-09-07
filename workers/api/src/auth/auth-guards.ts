import type { Context } from 'hono';
import { ApiError, type ApiEnv } from '../errors';
import { createAuth } from './index';

export const requireUser = async (c: Context<ApiEnv>) => {
  const { response: session, headers } = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
    returnHeaders: true,
  });

  for (const cookie of headers.getSetCookie()) {
    c.header('Set-Cookie', cookie, { append: true });
  }

  if (!session) {
    throw new ApiError(
      'auth_required',
      'A valid session is required.',
      401,
    );
  }

  return session.user;
};
