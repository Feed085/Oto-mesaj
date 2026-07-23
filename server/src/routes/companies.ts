import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

// Use PostgreSQL for Vercel, lowdb for local development
const dbModule = process.env.POSTGRES_URL || process.env.DATABASE_URL
  ? await import("../db-postgres.js")
  : await import("../db.js");
const { db } = dbModule;

const router = Router();

// Get all companies for authenticated user
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.read();
    const userCompanies = db.data?.companies.filter(c => c.userId === req.userId) || [];
    res.json({
      success: true,
      data: userCompanies,
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

    await db.read();
    const companyIndex = db.data?.companies.findIndex(
      (c) => c.id === id && c.userId === req.userId
    );

    if (companyIndex === undefined || companyIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Şirket bulunamadı.",
      });
      return;
    }

    db.data!.companies[companyIndex].sent = sent;
    await db.write();

    res.json({
      success: true,
      data: db.data!.companies[companyIndex],
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

    await db.read();
    
    // Verify process belongs to user
    const process = db.data?.processes.find(p => p.id === processId && p.userId === req.userId);
    if (!process) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    // Delete companies for this process
    db.data!.companies = db.data!.companies.filter(c => c.processId !== processId);
    await db.write();

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
