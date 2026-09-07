import { Hono } from 'hono';
import { createAuth } from '../auth';
import { verifyTurnstile } from '../auth/turnstile';
import { ApiError, errorResponse, type ApiEnv } from '../errors';

const auth = new Hono<ApiEnv>();

// Protect magic-link sign-in with Turnstile verification
auth.post('/api/auth/sign-in/magic-link', async (c) => {
  const headerToken = c.req.header('cf-turnstile-response') || c.req.header('x-turnstile-token');

  let bodyJson: Record<string, unknown> = {};
  let bodyToken: string | undefined;
  try {
    const cloned = c.req.raw.clone();
    bodyJson = (await cloned.json()) as Record<string, unknown>;
    if (typeof bodyJson.turnstileToken === 'string') {
      bodyToken = bodyJson.turnstileToken;
    }
  } catch {
    // Let Better Auth handle malformed bodies
  }

  const token = headerToken || bodyToken;
  const ip = c.req.header('cf-connecting-ip');
  const turnstileResult = await verifyTurnstile(c.env.TURNSTILE_SECRET_KEY, token, ip);

  if (!turnstileResult.success) {
    return errorResponse(
      c,
      new ApiError('turnstile_failed', 'Security verification failed. Please complete the captcha.', 403),
    );
  }

  // Forward clean body to Better Auth
  if (Object.keys(bodyJson).length > 0) {
    const { turnstileToken: _, ...cleanBody } = bodyJson;
    const cleanRequest = new Request(c.req.raw.url, {
      method: c.req.raw.method,
      headers: c.req.raw.headers,
      body: JSON.stringify(cleanBody),
    });
    return createAuth(c.env).handler(cleanRequest);
  }

  return createAuth(c.env).handler(c.req.raw);
});

// All other auth routes (sessions, sign-out, verify)
auth.all('/api/auth/*', (c) => createAuth(c.env).handler(c.req.raw));

export default auth;
