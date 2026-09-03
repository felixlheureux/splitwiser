import {
  groupCreateSchema,
  groupSchema,
  groupsResponseSchema,
  meSchema,
} from '@splitwiser/shared';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import {
  activityEventsTable,
  groupInvitesTable,
  groupMembershipsTable,
  groupParticipantsTable,
  groupsTable,
} from '../app-schema';
import { requireUser } from '../auth/auth-guards';
import { createDb } from '../db';
import { ApiError, type ApiEnv } from '../errors';

const groups = new Hono<ApiEnv>();

const fieldErrors = (error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) => {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    (result[key] ??= []).push(issue.message);
  }
  return result;
};

const parseGroupCreate = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(
      'invalid_request',
      'Request body must be valid JSON.',
      422,
    );
  }

  const result = groupCreateSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(
      'invalid_request',
      'The group details are invalid.',
      422,
      fieldErrors(result.error),
    );
  }
  return result.data;
};

groups.get('/me', async (c) => {
  const user = await requireUser(c);
  return c.json(
    meSchema.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    }),
  );
});

groups.get('/groups', async (c) => {
  const user = await requireUser(c);
  const db = createDb(c.env.DB);
  const result = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      currencyCode: groupsTable.currencyCode,
      currencyExponent: groupsTable.currencyExponent,
      revision: groupsTable.revision,
      createdAt: groupsTable.createdAt,
      updatedAt: groupsTable.updatedAt,
      role: groupMembershipsTable.role,
      membershipStatus: groupMembershipsTable.status,
      participantId: groupParticipantsTable.id,
      participantName: groupParticipantsTable.displayName,
      participantStatus: groupParticipantsTable.status,
      participantPosition: groupParticipantsTable.position,
    })
    .from(groupMembershipsTable)
    .innerJoin(
      groupsTable,
      eq(groupsTable.id, groupMembershipsTable.groupId),
    )
    .innerJoin(
      groupParticipantsTable,
      eq(
        groupParticipantsTable.id,
        groupMembershipsTable.participantId!,
      ),
    )
    .where(
      and(
        eq(groupMembershipsTable.userId, user.id),
        eq(groupMembershipsTable.status, 'active'),
        isNull(groupsTable.deletedAt),
      ),
    )
    .orderBy(desc(groupsTable.updatedAt), desc(groupsTable.id));

  return c.json(
    groupsResponseSchema.parse({
      groups: result.map((row) =>
        groupSchema.parse({
          id: row.id,
          name: row.name,
          currencyCode: row.currencyCode,
          currencyExponent: row.currencyExponent,
          revision: row.revision,
          role: row.role,
          membershipStatus: row.membershipStatus,
          participant: {
            id: row.participantId,
            displayName: row.participantName,
            status: row.participantStatus,
            position: row.participantPosition,
          },
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
      ),
    }),
  );
});

groups.post('/groups', async (c) => {
  const user = await requireUser(c);
  const input = await parseGroupCreate(c.req.raw);
  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();
  const participantId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const inviteId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  const db = createDb(c.env.DB);
  await db.batch([
    db.insert(groupsTable).values({
      id: groupId,
      name: input.name,
      currencyCode: input.currencyCode,
      currencyExponent: input.currencyExponent,
      revision: 0,
      createdAt: now,
      updatedAt: now,
    }),
    db.insert(groupParticipantsTable).values({
      id: participantId,
      groupId,
      displayName: user.name,
      status: 'active',
      position: 0,
      createdAt: now,
      updatedAt: now,
    }),
    db.insert(groupMembershipsTable).values({
      id: membershipId,
      groupId,
      userId: user.id,
      participantId,
      role: 'owner',
      status: 'active',
      joinedAt: now,
    }),
    db.insert(groupInvitesTable).values({
      id: inviteId,
      groupId,
      createdByMembershipId: membershipId,
      createdAt: now,
    }),
    db.insert(activityEventsTable).values({
      id: eventId,
      groupId,
      actorMembershipId: membershipId,
      eventType: 'group_created',
      entityType: 'group',
      entityId: groupId,
      summaryJson: JSON.stringify({ name: input.name }),
      createdAt: now,
    }),
  ]);

  return c.json(
    groupSchema.parse({
      id: groupId,
      name: input.name,
      currencyCode: input.currencyCode,
      currencyExponent: input.currencyExponent,
      revision: 0,
      role: 'owner',
      membershipStatus: 'active',
      participant: {
        id: participantId,
        displayName: user.name,
        status: 'active',
        position: 0,
      },
      createdAt: now,
      updatedAt: now,
    }),
    201,
  );
});

export default groups;
