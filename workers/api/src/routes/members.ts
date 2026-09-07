import {
  addMemberSchema,
  calculateBalances,
  groupSchema,
  joinGroupSchema,
  memberSchema,
} from '@splitwiser/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getIdentity } from '../auth/session';
import { createDb, expensesTable, groupMembersTable, groupsTable } from '../db';
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

  // Check if this identity is already a member of this group
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

  let memberId: string;
  const now = new Date().toISOString();

  if (input.memberId) {
    // Claiming / reclaiming an existing member
    const [existingMember] = await db
      .select()
      .from(groupMembersTable)
      .where(and(eq(groupMembersTable.id, input.memberId), eq(groupMembersTable.groupId, group.id)));

    if (!existingMember) throw new ApiError('not_found', 'Member not found.', 404);

    // If this identity is already assigned to a different member in this group, release the old one
    if (alreadyMember && alreadyMember.id !== existingMember.id) {
      await db
        .update(groupMembersTable)
        .set({
          userId: null,
          guestId: null,
        })
        .where(eq(groupMembersTable.id, alreadyMember.id));
    }

    const finalName = input.name?.trim() ? input.name.trim() : existingMember.name;

    await db
      .update(groupMembersTable)
      .set({
        name: finalName,
        userId: identity.type === 'user' ? identity.id : null,
        guestId: identity.type === 'guest' ? identity.id : null,
      })
      .where(eq(groupMembersTable.id, existingMember.id));

    memberId = existingMember.id;
  } else {
    // Adding a new member
    if (alreadyMember) {
      throw new ApiError('already_member', 'You are already a member of this group.', 409);
    }

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

// Remove a member from the group
members.delete('/api/groups/:id/members/:memberId', async (c) => {
  const identity = await getIdentity(c);
  const db = createDb(c.env.DB);
  const groupId = c.req.param('id');
  const memberId = c.req.param('memberId');

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
  if (!group) throw new ApiError('not_found', 'Group not found.', 404);

  const allMembers = await db
    .select()
    .from(groupMembersTable)
    .where(eq(groupMembersTable.groupId, groupId));

  const callerMember = allMembers.find((m) =>
    identity.type === 'user' ? m.userId === identity.id : m.guestId === identity.id,
  );

  if (!callerMember && group.createdBy !== identity.id) {
    throw new ApiError('forbidden', 'You must be a member of this group to remove someone.', 403);
  }

  const targetMember = allMembers.find((m) => m.id === memberId);
  if (!targetMember) throw new ApiError('not_found', 'Member not found in this group.', 404);

  if (callerMember && callerMember.id === memberId) {
    throw new ApiError('bad_request', 'You cannot remove yourself from the group.', 400);
  }

  // Check if member paid for any expenses
  const [paidExpense] = await db
    .select({ id: expensesTable.id })
    .from(expensesTable)
    .where(and(eq(expensesTable.groupId, groupId), eq(expensesTable.paidByMemberId, memberId)))
    .limit(1);

  if (paidExpense) {
    throw new ApiError(
      'member_has_expenses',
      `Cannot remove ${targetMember.name} because they have paid expenses in this group.`,
      400,
    );
  }

  // Check if member has an unsettled balance
  const expensesRows = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.groupId, groupId));

  const parsedExpenses = expensesRows.map((e) => ({
    id: e.id,
    groupId: e.groupId,
    description: e.description,
    amountCents: e.amountCents,
    paidByMemberId: e.paidByMemberId,
    splitType: e.splitType as 'equal' | 'settlement',
    splitWithMemberIds: JSON.parse(e.splitWithMemberIds || '[]') as string[],
    createdAt: e.createdAt,
  }));

  const { balances } = calculateBalances(allMembers, parsedExpenses);
  const targetBalance = balances.find((b) => b.memberId === memberId)?.balanceCents ?? 0;

  if (targetBalance !== 0) {
    throw new ApiError(
      'member_has_balance',
      `Cannot remove ${targetMember.name} because they have an unsettled balance. Settle up first.`,
      400,
    );
  }

  // Member has no paid expenses and zero balance: safe to delete
  await db.delete(groupMembersTable).where(eq(groupMembersTable.id, memberId));

  return c.json({ success: true });
});

export default members;
