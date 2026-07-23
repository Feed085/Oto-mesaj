import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

// Use PostgreSQL for Vercel, lowdb for local development
const dbModule = process.env.POSTGRES_URL || process.env.DATABASE_URL
  ? await import("../db-postgres.js")
  : await import("../db.js");
const { db } = dbModule;

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Tüm alanlar zorunludur.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    await db.read();

    const existingUser = db.data?.users.find(u => u.email === email);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Bu e-posta zaten kayıtlı.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      createdAt: Date.now(),
    };

    db.data!.users.push(newUser);
    await db.write();

    const token = generateToken(newUser.id);

    res.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kayıt hatası oluştu.';
    res.status(500).json({ success: false, error: message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'E-posta ve şifre zorunludur.' });
      return;
    }

    await db.read();

    const user = db.data?.users.find(u => u.email === email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Geçersiz e-posta veya şifre.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Geçersiz e-posta veya şifre.' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Giriş hatası oluştu.';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
