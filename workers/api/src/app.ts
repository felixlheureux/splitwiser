import { Hono } from 'hono';
import { createAuth } from './auth';
import { ApiError, errorResponse, type ApiEnv } from './errors';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import expenses from './routes/expenses';
import groups from './routes/groups';
import health from './routes/health';
import me from './routes/me';
import members from './routes/members';

import { getIdentity } from './auth/session';

const app = new Hono<ApiEnv>();

app.use('*', requestIdMiddleware);
app.use('*', corsMiddleware);
app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  c.header('Referrer-Policy', 'no-referrer');
  await getIdentity(c);
  await next();
});

app.route('/health', health);
app.route('/api/health', health);
app.route('/', me);
app.route('/', groups);
app.route('/', members);
app.route('/', expenses);

app.all('/api/auth/*', (c) => createAuth(c.env).handler(c.req.raw));

app.onError(errorHandler);

app.notFound((c) =>
  errorResponse(
    c,
    new ApiError('not_found', 'Route not found.', 404),
  ),
);

export default app;
