import { betterAuth } from 'better-auth';
import { authOptions } from './options';

export const auth = betterAuth(authOptions(async () => {}));
