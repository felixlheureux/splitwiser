import { identitySchema, profileUpdateSchema, userSchema } from '@splitwiser/shared';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import { user as users } from '../auth/auth-schema';
import { getIdentity } from '../auth/session';
import { createDb, groupMembersTable, groupsTable } from '../db';
import { ApiError, type ApiEnv } from '../errors';
import { parseBody } from '../validation';

const me = new Hono<ApiEnv>();

me.get('/api/me', async (c) => {
  const identity = await getIdentity(c);

  if (identity.type === 'user') {
    // If user has a guest cookie from prior anonymous browsing, merge it!
    const guestId = getCookie(c, 'splitwiser_guest');
    if (guestId) {
      const db = createDb(c.env.DB);
      await db.batch([
        db.update(groupsTable).set({ createdBy: identity.id }).where(eq(groupsTable.createdBy, guestId)),
        db.update(groupMembersTable).set({ userId: identity.id, guestId: null }).where(eq(groupMembersTable.guestId, guestId)),
      ]);
      deleteCookie(c, 'splitwiser_guest', { path: '/' });
    }

    return c.json(
      identitySchema.parse({
        type: 'user',
        id: identity.id,
        name: identity.name,
        email: identity.email,
      }),
    );
  }

  return c.json(
    identitySchema.parse({
      type: 'guest',
      id: identity.id,
      name: null,
    }),
  );
});

me.patch('/api/me', async (c) => {
  const identity = await getIdentity(c);
  if (identity.type !== 'user') {
    throw new ApiError('auth_required', 'Sign in to update your profile.', 401);
  }

  const input = await parseBody(c.req.raw, profileUpdateSchema);
  const db = createDb(c.env.DB);
  await db.update(users).set({ name: input.name }).where(eq(users.id, identity.id));

  return c.json(
    userSchema.parse({
      id: identity.id,
      name: input.name,
      email: identity.email,
    }),
  );
});

export default me;
