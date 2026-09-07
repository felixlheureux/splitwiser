import { z } from 'zod';

// Base ID & Date
export const idSchema = z.string().min(1);

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('splitwiser-api-production'),
  database: z.literal('ok'),
});

// User & Identity
export const userSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: z.email(),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const identitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user'),
    id: idSchema,
    name: z.string(),
    email: z.string(),
  }),
  z.object({
    type: z.literal('guest'),
    id: idSchema,
    name: z.string().nullable(),
  }),
]);

// Group & Members
export const groupSchema = z.object({
  id: idSchema,
  name: z.string(),
  inviteCode: z.string(),
  createdAt: z.string(),
});

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(80),
  creatorName: z.string().trim().min(1, 'Your name is required').max(80),
});

export const memberSchema = z.object({
  id: idSchema,
  groupId: idSchema,
  name: z.string(),
  userId: z.string().nullable(),
  isClaimed: z.boolean(),
  createdAt: z.string(),
});

export const addMemberSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const joinGroupSchema = z.object({
  memberId: idSchema.optional(),
  name: z.string().trim().min(1).max(80).optional(),
});

// Expenses & Splits
export const splitTypeSchema = z.enum(['equal', 'settlement']);

export const expenseSchema = z.object({
  id: idSchema,
  groupId: idSchema,
  description: z.string(),
  amountCents: z.number().int().positive(),
  paidByMemberId: idSchema,
  splitType: splitTypeSchema,
  splitWithMemberIds: z.array(idSchema),
  createdAt: z.string(),
});

export const createExpenseSchema = z.object({
  description: z.string().trim().min(1).max(120),
  amountCents: z.number().int().positive(),
  paidByMemberId: idSchema,
  splitType: splitTypeSchema.default('equal'),
  splitWithMemberIds: z.array(idSchema).min(1),
});

// Balances & Repayments
export const memberBalanceSchema = z.object({
  memberId: idSchema,
  name: z.string(),
  balanceCents: z.number().int(),
});

export const suggestedRepaymentSchema = z.object({
  fromMemberId: idSchema,
  fromName: z.string(),
  toMemberId: idSchema,
  toName: z.string(),
  amountCents: z.number().int().positive(),
});

export const groupDetailSchema = z.object({
  group: groupSchema,
  members: z.array(memberSchema),
  expenses: z.array(expenseSchema),
  balances: z.array(memberBalanceSchema),
  suggestedRepayments: z.array(suggestedRepaymentSchema),
  myMemberId: idSchema.nullable(),
});

export const groupsResponseSchema = z.object({
  groups: z.array(groupSchema),
});

export const successSchema = z.object({
  success: z.literal(true),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    requestId: z.string().optional(),
  }),
});

// Inferred Types
export type User = z.infer<typeof userSchema>;
export type Me = User;
export const meSchema = userSchema;

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type Group = z.infer<typeof groupSchema>;
export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type GroupCreate = CreateGroupInput;
export const currencyCodeSchema = z.string().default('USD');

export type Member = z.infer<typeof memberSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type SplitType = z.infer<typeof splitTypeSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type MemberBalance = z.infer<typeof memberBalanceSchema>;
export type SuggestedRepayment = z.infer<typeof suggestedRepaymentSchema>;
export type GroupDetail = z.infer<typeof groupDetailSchema>;
export type GroupsResponse = z.infer<typeof groupsResponseSchema>;
export type SuccessResponse = z.infer<typeof successSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
