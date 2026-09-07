import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { createDb } from '../db';
import * as schema from './auth-schema';
import { sendOtpEmail } from './email';
import { authOptions } from './options';

export const createAuth = (env: Env) =>
  betterAuth({
    ...authOptions(({ email, otp }) => sendOtpEmail(env, email, otp)),
    database: drizzleAdapter(createDb(env.DB), { provider: 'sqlite', schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.API_ORIGIN,
    trustedOrigins: [
      env.APP_ORIGIN,
      'https://dash.splitwiser.app',
      'https://splitwiser-dashboard-production.pages.dev',
      'http://localhost:5173',
    ],
  });
