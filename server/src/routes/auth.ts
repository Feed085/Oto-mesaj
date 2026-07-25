import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { sql } from '../db.js';
import { generateToken } from '../middleware/auth.js';

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

    const emailLower = email.toLowerCase();
    const existingUsers = await sql`SELECT * FROM users WHERE email = ${emailLower}`;
    if (existingUsers.length > 0) {
      res.status(400).json({ success: false, error: 'Bu e-posta zaten kayıtlı.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;
    const createdAt = Date.now();

    await sql`
      INSERT INTO users (id, email, password, name, created_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, ${createdAt})
    `;

    const token = generateToken(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name,
          createdAt,
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

    const emailLower = email.toLowerCase();
    const users = await sql`SELECT * FROM users WHERE email = ${emailLower}`;
    
    if (users.length === 0) {
      res.status(401).json({ success: false, error: 'Bu hesap kayıtlı değil.' });
      return;
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Şifre yanlış.' });
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
          createdAt: Number(user.created_at || user.createdAt),
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
