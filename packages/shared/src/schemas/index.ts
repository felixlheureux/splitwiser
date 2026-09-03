import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    requestId: z.string(),
  }),
});

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('splitwiser-api-production'),
  database: z.literal('ok'),
});

export const idSchema = z.uuid();
export const userIdSchema = z.string().min(1);

export const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Currency must be an ISO 4217 code.');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return date.toISOString().startsWith(value);
  }, 'Date must be a real calendar date.');

export const groupCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  currencyCode: currencyCodeSchema,
  currencyExponent: z.number().int().min(0).max(9),
});

export const groupUpdateSchema = groupCreateSchema.pick({
  name: true,
});

export const participantCreateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
});

export const participantSchema = z.object({
  id: idSchema,
  displayName: z.string(),
  status: z.enum(['active', 'archived', 'locked']),
  position: z.number().int().nonnegative(),
});

export const groupSchema = z.object({
  id: idSchema,
  name: z.string(),
  currencyCode: currencyCodeSchema,
  currencyExponent: z.number().int().min(0).max(9),
  revision: z.number().int().nonnegative(),
  role: z.enum(['owner', 'member']),
  membershipStatus: z.enum(['active', 'left', 'removed']),
  participant: participantSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const meSchema = z.object({
  id: userIdSchema,
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
});

export const groupsResponseSchema = z.object({
  groups: z.array(groupSchema),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type GroupCreate = z.infer<typeof groupCreateSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Me = z.infer<typeof meSchema>;
