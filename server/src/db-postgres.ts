import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
});

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: number;
}

interface Process {
  id: string;
  name: string;
  description: string | null;
  created_at: number;
  pdf_file: string | null;
  user_id: string;
}

interface Company {
  id: string;
  name: string;
  phone: string;
  raw_phone: string;
  message: string;
  sent: boolean;
  created_at: number;
  process_id: string;
  user_id: string;
}

interface Data {
  users: Array<{
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: number;
  }>;
  processes: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    pdfFile?: string;
    userId: string;
  }>;
  companies: Array<{
    id: string;
    name: string;
    phone: string;
    rawPhone: string;
    message: string;
    sent: boolean;
    createdAt: number;
    processId: string;
    userId: string;
  }>;
}

const defaultData: Data = {
  users: [],
  processes: [],
  companies: [],
};

class PostgresDB {
  data: Data = defaultData;
  private client: PoolClient | null = null;

  async read() {
    try {
      this.client = await pool.connect();
      
      // Read users
      const usersResult = await this.client.query('SELECT * FROM users ORDER BY created_at DESC');
      this.data.users = usersResult.rows.map((row: User) => ({
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        createdAt: row.created_at,
      }));

      // Read processes
      const processesResult = await this.client.query('SELECT * FROM processes ORDER BY created_at DESC');
      this.data.processes = processesResult.rows.map((row: Process) => ({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        createdAt: row.created_at,
        pdfFile: row.pdf_file || undefined,
        userId: row.user_id,
      }));

      // Read companies
      const companiesResult = await this.client.query('SELECT * FROM companies ORDER BY created_at DESC');
      this.data.companies = companiesResult.rows.map((row: Company) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        rawPhone: row.raw_phone,
        message: row.message,
        sent: row.sent,
        createdAt: row.created_at,
        processId: row.process_id,
        userId: row.user_id,
      }));

    } catch (error) {
      // If tables don't exist, initialize them
      if (error instanceof Error && error.message.includes('does not exist')) {
        await this.initTables();
        this.data = { ...defaultData };
      } else {
        console.error('Error reading from database:', error);
        throw error;
      }
    } finally {
      if (this.client) {
        this.client.release();
        this.client = null;
      }
    }
  }

  async write() {
    try {
      this.client = await pool.connect();

      // Users are not modified in current operations, so skip for now
      // If needed, implement upsert logic for users

      // Sync processes
      const existingProcessIds = new Set();
      const processesResult = await this.client.query('SELECT id FROM processes');
      processesResult.rows.forEach((row: { id: string }) => existingProcessIds.add(row.id));

      for (const process of this.data.processes) {
        if (existingProcessIds.has(process.id)) {
          await this.client.query(
            'UPDATE processes SET name = $1, description = $2, pdf_file = $3 WHERE id = $4',
            [process.name, process.description || null, process.pdfFile || null, process.id]
          );
        } else {
          await this.client.query(
            'INSERT INTO processes (id, name, description, pdf_file, user_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [process.id, process.name, process.description || null, process.pdfFile || null, process.userId, process.createdAt]
          );
        }
      }

      // Sync companies
      const existingCompanyIds = new Set();
      const companiesResult = await this.client.query('SELECT id FROM companies');
      companiesResult.rows.forEach((row: { id: string }) => existingCompanyIds.add(row.id));

      for (const company of this.data.companies) {
        if (existingCompanyIds.has(company.id)) {
          await this.client.query(
            'UPDATE companies SET name = $1, phone = $2, raw_phone = $3, message = $4, sent = $5 WHERE id = $6',
            [company.name, company.phone, company.rawPhone, company.message, company.sent, company.id]
          );
        } else {
          await this.client.query(
            'INSERT INTO companies (id, name, phone, raw_phone, message, sent, created_at, process_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [company.id, company.name, company.phone, company.rawPhone, company.message, company.sent, company.createdAt, company.processId, company.userId]
          );
        }
      }

    } catch (error) {
      console.error('Error writing to database:', error);
      throw error;
    } finally {
      if (this.client) {
        this.client.release();
        this.client = null;
      }
    }
  }

  private async initTables() {
    try {
      this.client = await pool.connect();

      await this.client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at BIGINT NOT NULL
        )
      `);

      await this.client.query(`
        CREATE TABLE IF NOT EXISTS processes (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          pdf_file TEXT,
          user_id VARCHAR(255) NOT NULL,
          created_at BIGINT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await this.client.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          raw_phone TEXT NOT NULL,
          message TEXT,
          sent BOOLEAN DEFAULT FALSE,
          created_at BIGINT NOT NULL,
          process_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    } finally {
      if (this.client) {
        this.client.release();
        this.client = null;
      }
    }
  }
}

const db = new PostgresDB();

export async function initDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export { db };
