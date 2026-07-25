import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF, parseTextToCompanies } from "../utils/pdfParser.js";
import { normalizePhone } from "../utils/phoneNormalizer.js";
import { sql } from "../db.js";
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

    // Verify process belongs to user
    const processResult = await sql`
      SELECT id FROM processes WHERE id = ${processId} AND user_id = ${req.userId}
    `;

    if (processResult.length === 0) {
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
      const uploadsDir = process.env.VERCEL
        ? "/tmp/uploads"
        : path.resolve(__dirname, "../../uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${processId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      pdfUrl = `/api/uploads/${filename}`;
    }

    // Save PDF relation to process
    await sql`
      UPDATE processes 
      SET pdf_file = ${pdfUrl}
      WHERE id = ${processId} AND user_id = ${req.userId}
    `;

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

    // Save companies to database sequentially to avoid overwhelming connection pool
    for (const c of companies) {
      await sql`
        INSERT INTO companies (id, name, phone, raw_phone, message, sent, process_id, user_id, created_at)
        VALUES (${c.id}, ${c.name}, ${c.phone}, ${c.rawPhone}, ${c.message}, ${c.sent}, ${c.processId}, ${c.userId}, ${c.createdAt})
      `;
    }

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
