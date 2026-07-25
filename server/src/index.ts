import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pdfRoutes from "./routes/pdf.js";
import processRoutes from "./routes/processes.js";
import authRoutes from "./routes/auth.js";
import companiesRoutes from "./routes/companies.js";
import { initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded PDFs statically
app.use("/api/uploads", express.static(
  process.env.VERCEL ? "/tmp/uploads" : path.join(__dirname, "../uploads")
));

app.use("/api", pdfRoutes);
app.use("/api/processes", processRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

async function start() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server http://0.0.0.0:${PORT} adresinde çalışıyor`);
  });
}

start();
