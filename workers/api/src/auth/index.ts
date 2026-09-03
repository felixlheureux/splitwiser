import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { createDb } from '../db';

const allowedOrigins = [
  'http://localhost:5173',
  'https://dash.splitwiser.app',
];

export const createAuth = (env: Env) =>
  betterAuth({
    database: drizzleAdapter(createDb(env.DB), {
      provider: 'sqlite',
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.API_ORIGIN,
    trustedOrigins: allowedOrigins,
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      emailOTP({
        otpLength: 8,
        expiresIn: 600,
        allowedAttempts: 3,
        overrideDefaultEmailVerification: true,
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== 'sign-in' && type !== 'email-verification') {
            return;
          }

          const response = await fetch(
            'https://api.resend.com/emails',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Splitwiser <login@splitwiser.app>',
                to: [email],
                subject: 'Your Splitwiser sign-in code',
                text: `Your Splitwiser sign-in code is ${otp}. It expires in 10 minutes.`,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(
              `Resend request failed with status ${response.status}`,
            );
          }
        },
      }),
    ],
  });
