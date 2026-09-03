import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const groupsTable = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currencyCode: text('currency_code').notNull(),
  currencyExponent: integer('currency_exponent').notNull(),
  revision: integer('revision').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  purgeAfter: text('purge_after'),
});

export const groupParticipantsTable = sqliteTable(
  'group_participants',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id').notNull(),
    displayName: text('display_name').notNull(),
    status: text('status').notNull(),
    position: integer('position').notNull(),
    createdByMembershipId: text('created_by_membership_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('participants_by_group_status_position').on(
      table.groupId,
      table.status,
      table.position,
      table.id,
    ),
    uniqueIndex('group_participants_id_group_unique').on(
      table.id,
      table.groupId,
    ),
  ],
);

export const groupMembershipsTable = sqliteTable(
  'group_memberships',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id').notNull(),
    userId: text('user_id').notNull(),
    participantId: text('participant_id'),
    role: text('role').notNull(),
    status: text('status').notNull(),
    joinedViaInviteId: text('joined_via_invite_id'),
    joinedAt: text('joined_at').notNull(),
    leftAt: text('left_at'),
    removedAt: text('removed_at'),
  },
  (table) => [
    uniqueIndex('memberships_user_group_unique').on(
      table.groupId,
      table.userId,
    ),
    index('memberships_by_user_status').on(
      table.userId,
      table.status,
      table.groupId,
    ),
  ],
);

export const groupInvitesTable = sqliteTable('group_invites', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  createdByMembershipId: text('created_by_membership_id').notNull(),
  createdAt: text('created_at').notNull(),
  revokedAt: text('revoked_at'),
});

export const activityEventsTable = sqliteTable('activity_events', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  actorMembershipId: text('actor_membership_id'),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  summaryJson: text('summary_json').notNull(),
  createdAt: text('created_at').notNull(),
});
