import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF, parseTextToCompanies } from "../utils/pdfParser.js";
import { normalizePhone } from "../utils/phoneNormalizer.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Sadece PDF dosyaları kabul edilmektedir."));
    }
  },
});

router.post("/parse-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "PDF dosyası yüklenmedi.",
      });
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
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({
      success: false,
      error: `PDF işlenirken hata: ${message}`,
    });
  }
});

export default router;
