import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../data/db.json');

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

const adapter = new JSONFile<Data>(dbFile);
const db = new Low<Data>(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export { db };

