import type { ErrorHandler } from 'hono';
import { ApiError, errorResponse, type ApiEnv } from '../errors';

export const errorHandler: ErrorHandler<ApiEnv> = (error, c) => {
  if (error instanceof ApiError) {
    return errorResponse(c, error);
  }

  console.error(
    JSON.stringify({
      message: 'unhandled api error',
      error: error instanceof Error ? error.message : String(error),
      path: new URL(c.req.url).pathname,
      requestId: c.get('requestId'),
    }),
  );

  return errorResponse(
    c,
    new ApiError(
      'internal_error',
      'An unexpected error occurred.',
      500,
    ),
  );
};
