import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const groupsTable = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  archivedAt: text('archived_at'),
});

export const groupMembersTable = sqliteTable(
  'group_members',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    userId: text('user_id'),
    guestId: text('guest_id'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_group_members_group_id').on(table.groupId),
    index('idx_group_members_user_id').on(table.userId),
    index('idx_group_members_guest_id').on(table.guestId),
  ],
);

export const expensesTable = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    paidByMemberId: text('paid_by_member_id')
      .notNull()
      .references(() => groupMembersTable.id, { onDelete: 'cascade' }),
    splitType: text('split_type').notNull(), // 'equal' | 'settlement'
    splitWithMemberIds: text('split_with_member_ids').notNull(), // JSON string array
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_expenses_group_id').on(table.groupId)],
);
