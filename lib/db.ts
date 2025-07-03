import { Database } from './types'
import { Kysely } from 'kysely'
import { NeonDialect } from 'kysely-neon';

const dialect = new NeonDialect({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

export const db = new Kysely<Database>({
    dialect,
})