import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { ApiError, errorResponse, type ApiEnv } from './errors';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import auth from './routes/auth';
import expenses from './routes/expenses';
import groups from './routes/groups';
import health from './routes/health';
import me from './routes/me';
import members from './routes/members';

import { getIdentity } from './auth/session';

const app = new Hono<ApiEnv>();

app.use('*', requestIdMiddleware);
app.use('*', corsMiddleware);
app.use(
  '/api/*',
  bodyLimit({
    maxSize: 50 * 1024,
    onError: (c) =>
      errorResponse(
        c,
        new ApiError('payload_too_large', 'Request payload too large (max 50KB).', 413),
      ),
  }),
);
app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  c.header('Referrer-Policy', 'no-referrer');
  if (!c.req.path.startsWith('/api/auth')) {
    await getIdentity(c);
  }
  await next();
});

app.route('/health', health);
app.route('/api/health', health);
app.route('/', me);
app.route('/', groups);
app.route('/', members);
app.route('/', expenses);
app.route('/', auth);

app.onError(errorHandler);

app.notFound((c) =>
  errorResponse(
    c,
    new ApiError('not_found', 'Route not found.', 404),
  ),
);

export default app;
