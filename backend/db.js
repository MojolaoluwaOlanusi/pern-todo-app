import { Pool } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_k0phvPTzGl5E@ep-restless-water-a4nunlxk-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!connectionString) {
    throw new Error('No database connection string found. Set NEON_URI or DATABASE_URL in .env');
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
