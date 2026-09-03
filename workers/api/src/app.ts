import { Hono } from 'hono';
import { createAuth } from './auth';
import { ApiError, errorResponse, type ApiEnv } from './errors';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import groups from './routes/groups';
import health from './routes/health';

const app = new Hono<ApiEnv>();

app.use('*', requestIdMiddleware);
app.use('*', corsMiddleware);

app.route('/health', health);
app.route('/api/v1/health', health);
app.route('/api/v1', groups);

app.all('/api/auth/*', (c) => createAuth(c.env).handler(c.req.raw));

app.onError(errorHandler);

app.notFound((c) =>
  errorResponse(
    c,
    new ApiError('not_found', 'Route not found.', 404),
  ),
);

export default app;
