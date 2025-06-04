import { Pool } from 'pg';

let pool: Pool;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
}

try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    pool.on('connect', () => {
        console.log('🐘 Connected to NeonDB');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

} catch (error) {
    console.error('Failed to initialize NeonDB pool:', error);
    throw error;
}


export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        const duration = Date.now() - start;
        console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } finally {
        client.release();
    }
};

export async function initializeDbSchema() {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Users table checked/created successfully.');
    } catch (error) {
        console.error('Error initializing database schema:', error);
    }
}