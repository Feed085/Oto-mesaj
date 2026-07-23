import express from "express";
import cors from "cors";
import pdfRoutes from "../server/src/routes/pdf.js";
import processRoutes from "../server/src/routes/processes.js";
import authRoutes from "../server/src/routes/auth.js";
import companiesRoutes from "../server/src/routes/companies.js";

// Use PostgreSQL for Vercel, lowdb for local development
const dbModule = process.env.POSTGRES_URL || process.env.DATABASE_URL
  ? await import("../server/src/db-postgres.js")
  : await import("../server/src/db.js");
const { initDb } = dbModule;

const app = express();

app.use(cors());
app.use(express.json());

// Lazy database initialization middleware for Serverless context
let dbInitialized = false;
const ensureDbInit = async (req: any, res: any, next: any) => {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  }
  next();
};

app.use(ensureDbInit);

// Mount API routes
app.use("/api", pdfRoutes);
app.use("/api/processes", processRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

export default app;
