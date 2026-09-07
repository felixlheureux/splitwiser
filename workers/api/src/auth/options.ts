import type { BetterAuthOptions } from 'better-auth';
import { magicLink, type MagicLinkOptions } from 'better-auth/plugins/magic-link';

// Shared by the running Worker and auth schema generation.
export const authOptions = (sendMagicLink: MagicLinkOptions['sendMagicLink']) => ({
  emailAndPassword: { enabled: false },
  session: { expiresIn: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 * 30 },
  advanced: {
    database: { generateId: 'uuid' },
    ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
  },
  rateLimit: { enabled: true, storage: 'database' },
  plugins: [magicLink({ expiresIn: 600, storeToken: 'hashed', sendMagicLink })],
} satisfies BetterAuthOptions);
