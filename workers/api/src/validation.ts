import type { z } from 'zod';
import { ApiError } from './errors';

export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError('invalid_request', 'Request body must be valid JSON.', 422);
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      (fields[issue.path.join('.') || 'form'] ??= []).push(issue.message);
    }
    throw new ApiError('invalid_request', 'Please check the highlighted fields.', 422, fields);
  }
  return result.data;
}
