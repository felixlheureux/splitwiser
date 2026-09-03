import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';

export const auth = betterAuth({
  plugins: [
    emailOTP({
      otpLength: 8,
      expiresIn: 600,
      allowedAttempts: 3,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP() {},
    }),
  ],
});
