import { Router } from "express";
import { db } from "../db.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all processes for authenticated user
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.read();
    const userProcesses = db.data?.processes.filter(p => p.userId === req.userId) || [];
    res.json({
      success: true,
      data: userProcesses.sort((a, b) => b.createdAt - a.createdAt),
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

    await db.read();

    const newProcess = {
      id: `process-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || undefined,
      createdAt: Date.now(),
      userId: req.userId!,
    };

    db.data!.processes.push(newProcess);
    await db.write();

    res.json({
      success: true,
      data: newProcess,
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

    await db.read();
    const processIndex = db.data?.processes.findIndex(
      (p) => p.id === id && p.userId === req.userId
    );

    if (processIndex === undefined || processIndex === -1) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    db.data!.processes[processIndex].pdfFile = pdfFile;
    await db.write();

    res.json({
      success: true,
      data: db.data!.processes[processIndex],
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

    await db.read();
    const processIndex = db.data?.processes.findIndex(
      (p) => p.id === id && p.userId === req.userId
    );

    if (processIndex === undefined || processIndex === -1) {
      res.status(404).json({
        success: false,
        error: "İşlem bulunamadı.",
      });
      return;
    }

    // Delete the process
    db.data!.processes.splice(processIndex, 1);

    // Delete associated companies
    db.data!.companies = db.data!.companies.filter(c => c.processId !== id);

    await db.write();

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
