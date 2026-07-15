import express from "express";
import cors from "cors";
import pdfRoutes from "./routes/pdf.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", pdfRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server http://0.0.0.0:${PORT} adresinde çalışıyor`);
});
