import { drizzle } from 'drizzle-orm/d1';

export * from './schema';

export const createDb = (database: D1Database) => drizzle(database);
export type Database = ReturnType<typeof createDb>;
