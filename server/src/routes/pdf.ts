import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF, parseTextToCompanies } from "../utils/pdfParser.js";
import { normalizePhone } from "../utils/phoneNormalizer.js";
import { db } from "../db.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { put } from "@vercel/blob";

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

router.post("/parse-pdf", authenticate, upload.single("pdf"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "PDF dosyası yüklenmedi.",
      });
      return;
    }

    const { processId } = req.body;
    if (!processId) {
      res.status(400).json({
        success: false,
        error: "İşlem ID gerekli.",
      });
      return;
    }

    await db.read();

    // Verify process belongs to user
    const processIndex = db.data?.processes.findIndex(p => p.id === processId && p.userId === req.userId);
    if (processIndex === undefined || processIndex === -1) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    let pdfUrl = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel Blob storage
      const filename = `uploads/${req.userId}/${processId}-${Date.now()}.pdf`;
      const blob = await put(filename, req.file.buffer, {
        access: "public",
        contentType: "application/pdf",
      });
      pdfUrl = blob.url;
    } else {
      // Local storage
      const fs = await import("fs");
      const path = await import("path");
      const { fileURLToPath } = await import("url");

      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const uploadsDir = path.resolve(__dirname, "../../uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${processId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      pdfUrl = `/api/uploads/${filename}`;
    }

    // Save PDF relation to process
    db.data!.processes[processIndex].pdfFile = pdfUrl;

    const { text, totalPages } = await extractTextFromPDF(req.file.buffer);
    const result = parseTextToCompanies(text, totalPages);

    const companies = result.companies.map((c, index) => ({
      id: `company-${Date.now()}-${index}`,
      name: c.name,
      phone: normalizePhone(c.phone),
      rawPhone: c.rawLine,
      message: "",
      sent: false,
      createdAt: Date.now(),
      processId,
      userId: req.userId!,
    }));

    // Save companies to database
    db.data!.companies.push(...companies);
    await db.write();

    res.json({
      success: true,
      data: {
        companies,
        totalPages: result.totalPages,
        totalLines: result.totalLines,
        parsedLines: result.parsedLines,
        errors: result.errors,
        pdfFile: pdfUrl,
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
