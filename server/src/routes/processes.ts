import { Router } from "express";
import { sql } from "../db.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all processes for authenticated user
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userProcesses = await sql`
      SELECT id, name, description, pdf_file as "pdfFile", user_id as "userId", created_at as "createdAt"
      FROM processes
      WHERE user_id = ${req.userId}
      ORDER BY created_at DESC
    `;

    const formattedProcesses = userProcesses.map(p => ({
      ...p,
      createdAt: Number(p.createdAt),
    }));

    res.json({
      success: true,
      data: formattedProcesses,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Create a new process
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "İşlem adı zorunludur.",
      });
      return;
    }

    const processId = `process-${Date.now()}`;
    const createdAt = Date.now();
    const nameTrimmed = name.trim();
    const descTrimmed = description?.trim() || null;

    await sql`
      INSERT INTO processes (id, name, description, user_id, created_at)
      VALUES (${processId}, ${nameTrimmed}, ${descTrimmed}, ${req.userId}, ${createdAt})
    `;

    res.json({
      success: true,
      data: {
        id: processId,
        name: nameTrimmed,
        description: descTrimmed || undefined,
        createdAt,
        userId: req.userId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({
      success: false,
      error: `İşlem oluşturulurken hata: ${message}`,
    });
  }
});

// Update process with PDF file
router.patch("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { pdfFile } = req.body;

    const result = await sql`
      UPDATE processes
      SET pdf_file = ${pdfFile}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id, name, description, pdf_file as "pdfFile", user_id as "userId", created_at as "createdAt"
    `;

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    const updated = result[0];
    res.json({
      success: true,
      data: {
        ...updated,
        createdAt: Number(updated.createdAt),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({
      success: false,
      error: `İşlem güncellenirken hata: ${message}`,
    });
  }
});

// Delete a process
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM processes
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    res.json({
      success: true,
      message: "İşlem başarıyla silindi.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    res.status(500).json({
      success: false,
      error: `İşlem silinirken hata: ${message}`,
    });
  }
});

export default router;
