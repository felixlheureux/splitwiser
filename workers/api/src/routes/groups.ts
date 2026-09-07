import {
  calculateBalances,
  createGroupSchema,
  groupDetailSchema,
  groupSchema,
  groupsResponseSchema,
} from '@splitwiser/shared';
import { desc, eq, inArray, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { getIdentity } from '../auth/session';
import { createDb, expensesTable, groupMembersTable, groupsTable } from '../db';
import { ApiError, type ApiEnv } from '../errors';
import { parseBody } from '../validation';

const groups = new Hono<ApiEnv>();

// List groups belonging to the user or guest
groups.get('/api/groups', async (c) => {
  const identity = await getIdentity(c);
  const db = createDb(c.env.DB);

  // Find all groups where the caller is either the creator or a member
  const memberRows = await db
    .select({ groupId: groupMembersTable.groupId })
    .from(groupMembersTable)
    .where(
      identity.type === 'user'
        ? eq(groupMembersTable.userId, identity.id)
        : eq(groupMembersTable.guestId, identity.id),
    );

  const groupIds = Array.from(new Set(memberRows.map((r) => r.groupId)));

  const result = await db
    .select()
    .from(groupsTable)
    .where(
      groupIds.length > 0
        ? or(eq(groupsTable.createdBy, identity.id), inArray(groupsTable.id, groupIds))
        : eq(groupsTable.createdBy, identity.id),
    )
    .orderBy(desc(groupsTable.createdAt));

  return c.json(
    groupsResponseSchema.parse({
      groups: result.map((g) => ({
        id: g.id,
        name: g.name,
        inviteCode: g.inviteCode,
        createdAt: g.createdAt,
      })),
    }),
  );
});

// Create a new group
groups.post('/api/groups', async (c) => {
  const identity = await getIdentity(c);
  const input = await parseBody(c.req.raw, createGroupSchema);
  const db = createDb(c.env.DB);

  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const inviteCode = crypto.randomUUID().slice(0, 8);

  const newGroup = {
    id: groupId,
    name: input.name,
    inviteCode,
    createdBy: identity.id,
    createdAt: now,
  };

  const firstMember = {
    id: memberId,
    groupId,
    name: input.creatorName,
    userId: identity.type === 'user' ? identity.id : null,
    guestId: identity.type === 'guest' ? identity.id : null,
    createdAt: now,
  };

  await db.batch([
    db.insert(groupsTable).values(newGroup),
    db.insert(groupMembersTable).values(firstMember),
  ]);

  return c.json(groupSchema.parse(newGroup), 201);
});

// Get group detail (members, expenses, balances)
groups.get('/api/groups/:id', async (c) => {
  const identity = await getIdentity(c);
  const db = createDb(c.env.DB);
  const groupId = c.req.param('id');

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
  if (!group) throw new ApiError('not_found', 'Group not found.', 404);

  const members = await db
    .select()
    .from(groupMembersTable)
    .where(eq(groupMembersTable.groupId, groupId));

  const expensesRows = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.groupId, groupId))
    .orderBy(desc(expensesTable.createdAt));

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

  const { balances, suggestedRepayments } = calculateBalances(members, parsedExpenses);

  const myMember = members.find((m) =>
    identity.type === 'user' ? m.userId === identity.id : m.guestId === identity.id,
  );

  return c.json(
    groupDetailSchema.parse({
      group,
      members: members.map((m) => ({
        id: m.id,
        groupId: m.groupId,
        name: m.name,
        userId: m.userId,
        isClaimed: m.userId !== null || m.guestId !== null,
        createdAt: m.createdAt,
      })),
      expenses: parsedExpenses,
      balances,
      suggestedRepayments,
      myMemberId: myMember?.id ?? null,
    }),
  );
});

export default groups;
