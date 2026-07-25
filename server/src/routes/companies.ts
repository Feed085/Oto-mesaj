import { Router } from "express";
import { sql } from "../db.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all companies for authenticated user
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userCompanies = await sql`
      SELECT id, name, phone, raw_phone as "rawPhone", message, sent, process_id as "processId", user_id as "userId", created_at as "createdAt"
      FROM companies
      WHERE user_id = ${req.userId}
    `;

    const formattedCompanies = userCompanies.map(c => ({
      ...c,
      createdAt: Number(c.createdAt),
    }));

    res.json({
      success: true,
      data: formattedCompanies,
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

// Update company sent status
router.patch("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { sent } = req.body;

    const result = await sql`
      UPDATE companies
      SET sent = ${sent}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id, name, phone, raw_phone as "rawPhone", message, sent, process_id as "processId", user_id as "userId", created_at as "createdAt"
    `;

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: "Şirket bulunamadı.",
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
      error: message,
    });
  }
});

// Delete all companies for a process
router.delete("/process/:processId", authenticate, async (req: AuthRequest, res) => {
  try {
    const { processId } = req.params;

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

    // Delete companies for this process
    await sql`
      DELETE FROM companies WHERE process_id = ${processId} AND user_id = ${req.userId}
    `;

    res.json({
      success: true,
      message: "Şirketler başarıyla silindi.",
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

export default router;
