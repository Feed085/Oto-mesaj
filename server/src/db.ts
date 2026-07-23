import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { put } from '@vercel/blob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.VERCEL 
  ? join('/tmp', 'db.json') 
  : join(__dirname, '../data/db.json');

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

// Override write to also save to Blob Storage on Vercel
const originalWrite = db.write.bind(db);
db.write = async function() {
  await originalWrite();
  
  // On Vercel, also save to Blob Storage
  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const fs = await import('fs');
      const data = fs.readFileSync(dbFile, 'utf-8');
      await put('db.json', data, { access: 'public' });
    } catch (error) {
      console.error('Failed to save to blob storage:', error);
    }
  }
};

export async function initDb() {
  // On Vercel, try to load from Blob Storage first
  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list();
      const dbBlob = blobs.find(b => b.pathname === 'db.json');
      if (dbBlob) {
        const fs = await import('fs');
        const response = await fetch(dbBlob.url);
        const data = await response.text();
        fs.writeFileSync(dbFile, data);
      }
    } catch (error) {
      // Blob doesn't exist yet, that's fine
      console.log('No existing blob found, starting fresh');
    }
  }
  
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export { db };

