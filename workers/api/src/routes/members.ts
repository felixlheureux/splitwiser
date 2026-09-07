import {
  addMemberSchema,
  groupSchema,
  joinGroupSchema,
  memberSchema,
} from '@splitwiser/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getIdentity } from '../auth/session';
import { createDb, groupMembersTable, groupsTable } from '../db';
import { ApiError, type ApiEnv } from '../errors';
import { parseBody } from '../validation';

const members = new Hono<ApiEnv>();

// Pre-add an offline member
members.post('/api/groups/:id/members', async (c) => {
  const input = await parseBody(c.req.raw, addMemberSchema);
  const db = createDb(c.env.DB);
  const groupId = c.req.param('id');

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
  if (!group) throw new ApiError('not_found', 'Group not found.', 404);

  const now = new Date().toISOString();
  const newMember = {
    id: crypto.randomUUID(),
    groupId,
    name: input.name,
    userId: null,
    guestId: null,
    createdAt: now,
  };

  await db.insert(groupMembersTable).values(newMember);

  return c.json(
    memberSchema.parse({
      ...newMember,
      isClaimed: false,
    }),
    201,
  );
});

// Resolve invite link (returns group & members for joining)
members.get('/api/groups/join/:code', async (c) => {
  const code = c.req.param('code');
  const identity = await getIdentity(c);
  const db = createDb(c.env.DB);

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.inviteCode, code));
  if (!group) throw new ApiError('not_found', 'Invalid invite link.', 404);

  const groupMembers = await db
    .select()
    .from(groupMembersTable)
    .where(eq(groupMembersTable.groupId, group.id));

  const existingMember = groupMembers.find(
    (m) =>
      (identity.type === 'user' && m.userId === identity.id) ||
      (identity.type === 'guest' && m.guestId === identity.id),
  );

  return c.json({
    group: groupSchema.parse(group),
    alreadyMember: Boolean(existingMember),
    myMemberId: existingMember?.id ?? null,
    members: groupMembers.map((m) => ({
      id: m.id,
      name: m.name,
      isClaimed: m.userId !== null || m.guestId !== null,
    })),
  });
});

// Join group via invite link (claim existing member or add new)
members.post('/api/groups/join/:code', async (c) => {
  const code = c.req.param('code');
  const identity = await getIdentity(c);
  const input = await parseBody(c.req.raw, joinGroupSchema);
  const db = createDb(c.env.DB);

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.inviteCode, code));
  if (!group) throw new ApiError('not_found', 'Invalid invite link.', 404);

  // Reject if this identity is already a member of this group
  const [alreadyMember] = await db
    .select()
    .from(groupMembersTable)
    .where(
      and(
        eq(groupMembersTable.groupId, group.id),
        identity.type === 'user'
          ? eq(groupMembersTable.userId, identity.id)
          : eq(groupMembersTable.guestId, identity.id),
      ),
    );

  if (alreadyMember) {
    throw new ApiError('already_member', 'You are already a member of this group.', 409);
  }

  let memberId: string;
  const now = new Date().toISOString();

  if (input.memberId) {
    // Claiming an existing member
    const [existingMember] = await db
      .select()
      .from(groupMembersTable)
      .where(and(eq(groupMembersTable.id, input.memberId), eq(groupMembersTable.groupId, group.id)));

    if (!existingMember) throw new ApiError('not_found', 'Member not found.', 404);

    // If claimed by someone else, reject
    const isClaimedByOther =
      (existingMember.userId && (identity.type !== 'user' || existingMember.userId !== identity.id)) ||
      (existingMember.guestId && (identity.type !== 'guest' || existingMember.guestId !== identity.id));

    if (isClaimedByOther) {
      throw new ApiError('claim_taken', 'This member was already claimed.', 409);
    }

    await db
      .update(groupMembersTable)
      .set({
        userId: identity.type === 'user' ? identity.id : null,
        guestId: identity.type === 'guest' ? identity.id : null,
      })
      .where(eq(groupMembersTable.id, existingMember.id));

    memberId = existingMember.id;
  } else {
    // Adding a new member
    const name = input.name || (identity.type === 'user' ? identity.name : 'New Member');
    memberId = crypto.randomUUID();

    await db.insert(groupMembersTable).values({
      id: memberId,
      groupId: group.id,
      name,
      userId: identity.type === 'user' ? identity.id : null,
      guestId: identity.type === 'guest' ? identity.id : null,
      createdAt: now,
    });
  }

  const [joinedMember] = await db
    .select()
    .from(groupMembersTable)
    .where(eq(groupMembersTable.id, memberId));

  return c.json(
    {
      group: groupSchema.parse(group),
      member: memberSchema.parse({
        ...joinedMember,
        isClaimed: true,
      }),
    },
    201,
  );
});

export default members;
