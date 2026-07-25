import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL environment variable is not defined!");
}

const sql = neon(process.env.DATABASE_URL || "");

export async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Database initialization skipped.");
    return;
  }
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL
      );
    `;

    // Create processes table
    await sql`
      CREATE TABLE IF NOT EXISTS processes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        pdf_file TEXT,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        created_at BIGINT NOT NULL
      );
    `;

    // Create companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        raw_phone VARCHAR(255) NOT NULL,
        message TEXT,
        sent BOOLEAN DEFAULT FALSE,
        process_id VARCHAR(255) REFERENCES processes(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        created_at BIGINT NOT NULL
      );
    `;
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

export { sql };
