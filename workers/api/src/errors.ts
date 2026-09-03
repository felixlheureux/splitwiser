import type { Context } from 'hono';

export type ApiErrorCode =
  | 'auth_required'
  | 'forbidden'
  | 'not_found'
  | 'invalid_request'
  | 'internal_error';

type FieldErrors = Record<string, string[]>;

export type ApiEnv = {
  Bindings: Env;
  Variables: { requestId: string };
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status:
    | 400
    | 401
    | 403
    | 404
    | 409
    | 422
    | 429
    | 500
    | 503;
  readonly fieldErrors?: FieldErrors;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503,
    fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const errorResponse = (c: Context<ApiEnv>, error: ApiError) =>
  c.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.fieldErrors
          ? { fieldErrors: error.fieldErrors }
          : {}),
        requestId: c.get('requestId'),
      },
    },
    error.status,
  );
