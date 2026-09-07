import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { ApiEnv } from '../errors';
import { createAuth } from './index';

export type RequestIdentity =
  | { type: 'user'; id: string; name: string; email: string }
  | { type: 'guest'; id: string };

export async function getIdentity(c: Context<ApiEnv>): Promise<RequestIdentity> {
  const cached = c.get('identity' as any) as RequestIdentity | undefined;
  if (cached) return cached;

  // 1. Check Better Auth session if present
  try {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session?.user) {
      const userIdent: RequestIdentity = {
        type: 'user',
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
      c.set('identity' as any, userIdent);
      return userIdent;
    }
  } catch {
    // Continue to guest resolution
  }

  // 2. Check or issue guest cookie
  let guestId = getCookie(c, 'splitwiser_guest');
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    setCookie(c, 'splitwiser_guest', guestId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }

  const guestIdent: RequestIdentity = {
    type: 'guest',
    id: guestId,
  };
  c.set('identity' as any, guestIdent);
  return guestIdent;
}
