import type { BetterAuthOptions } from 'better-auth';
import { emailOTP, type EmailOTPOptions } from 'better-auth/plugins/email-otp';

// Shared by the running Worker and auth schema generation.
export const authOptions = (sendVerificationOTP: EmailOTPOptions['sendVerificationOTP']) => ({
  emailAndPassword: { enabled: false },
  session: { expiresIn: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 * 30 },
  advanced: {
    database: { generateId: 'uuid' },
    ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
  trustedOrigins: [
    'https://dash.splitwiser.app',
    'https://splitwiser-dashboard-production.pages.dev',
    'http://localhost:5173',
  ],
  rateLimit: { enabled: true, storage: 'database' },
  plugins: [emailOTP({ expiresIn: 600, otpLength: 6, sendVerificationOTP })],
} satisfies BetterAuthOptions);
