import express from "express";
import cors from "cors";
import multer from "multer";
import { extractTextFromPDF, parseTextToCompanies } from "../server/src/utils/pdfParser.js";
import { normalizePhone } from "../server/src/utils/phoneNormalizer.js";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.post("/api/parse-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "PDF dosyası yüklenmedi." });
      return;
    }

    const { text, totalPages } = await extractTextFromPDF(req.file.buffer);
    const result = parseTextToCompanies(text, totalPages);

    const companies = result.companies.map((c, index) => ({
      id: `company-${Date.now()}-${index}`,
      name: c.name,
      phone: normalizePhone(c.phone),
      rawPhone: c.rawLine,
    }));

    res.json({
      success: true,
      data: {
        companies,
        totalPages: result.totalPages,
        totalLines: result.totalLines,
        parsedLines: result.parsedLines,
        errors: result.errors,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({ success: false, error: `PDF işlenirken hata: ${message}` });
  }
});

export default app;
