import {
  createExpenseSchema,
  expenseSchema,
  successSchema,
} from '@splitwiser/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb, expensesTable, groupMembersTable, groupsTable } from '../db';
import { ApiError, type ApiEnv } from '../errors';
import { parseBody } from '../validation';

const expenses = new Hono<ApiEnv>();

// Add an expense or settlement
expenses.post('/api/groups/:id/expenses', async (c) => {
  const groupId = c.req.param('id');
  const input = await parseBody(c.req.raw, createExpenseSchema);
  const db = createDb(c.env.DB);

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
  if (!group) throw new ApiError('not_found', 'Group not found.', 404);

  const members = await db
    .select()
    .from(groupMembersTable)
    .where(eq(groupMembersTable.groupId, groupId));
  const memberIds = new Set(members.map((m) => m.id));

  if (!memberIds.has(input.paidByMemberId)) {
    throw new ApiError('invalid_request', 'Payer is not in this group.', 422);
  }

  for (const id of input.splitWithMemberIds) {
    if (!memberIds.has(id)) {
      throw new ApiError('invalid_request', 'Split member is not in this group.', 422);
    }
  }

  const now = new Date().toISOString();
  const newExpense = {
    id: crypto.randomUUID(),
    groupId,
    description: input.description,
    amountCents: input.amountCents,
    paidByMemberId: input.paidByMemberId,
    splitType: input.splitType,
    splitWithMemberIds: JSON.stringify(input.splitWithMemberIds),
    createdAt: now,
  };

  await db.insert(expensesTable).values(newExpense);

  return c.json(
    expenseSchema.parse({
      ...newExpense,
      splitWithMemberIds: input.splitWithMemberIds,
    }),
    201,
  );
});

// Delete an expense
expenses.delete('/api/groups/:id/expenses/:expenseId', async (c) => {
  const groupId = c.req.param('id');
  const expenseId = c.req.param('expenseId');
  const db = createDb(c.env.DB);

  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(and(eq(expensesTable.id, expenseId), eq(expensesTable.groupId, groupId)));
  if (!expense) throw new ApiError('not_found', 'Expense not found.', 404);

  await db.delete(expensesTable).where(eq(expensesTable.id, expenseId));

  return c.json(successSchema.parse({ success: true }));
});

export default expenses;
