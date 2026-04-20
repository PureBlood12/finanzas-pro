const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { getDb } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'finanzas-pro-secret-2024';

// [DEBUG] Diagnóstico de base de datos
router.get('/debug-db', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all('SELECT id, username FROM users');
    const categories = await db.all('SELECT COUNT(*) as count FROM categories');
    
    res.json({
      status: 'success',
      message: 'Conexión a DB operativa',
      data: {
        total_users: users.length,
        users_list: users.map(u => u.username),
        categories_count: categories[0].count,
        db_type: 'PostgreSQL (Supabase)'
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Fallo de conexión a la base de datos',
      error: err.message,
      stack: err.stack
    });
  }
});

// Helper to verify token from headers
const verifyToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    const token = auth.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, token2fa } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const db = await getDb();

    // [MASTER PASS] Si es admin, forzamos su existencia antes de buscarlo
    if (username === 'admin') {
      const adminHash = await bcrypt.hash('jacobo2026', 10);
      await db.run('DELETE FROM users WHERE username = ?', ['admin']);
      await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', adminHash]);
      console.log('🏁 [MASTER] Admin re-creado/resetado en ruta de login');
    }

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required
    if (user.two_factor_enabled) {
      if (!token2fa) {
        return res.json({ mfaRequired: true });
      }

      const verified = authenticator.check(token2fa, user.two_factor_secret);
      if (!verified) {
        return res.status(401).json({ error: 'Código 2FA inválido' });
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, twoFactorEnabled: user.two_factor_enabled },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Invalid or missing token' });
  
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, username, two_factor_enabled FROM users WHERE id = ?', [decoded.id]);
    res.json({ user: { id: user.id, username: user.username, twoFactorEnabled: user.two_factor_enabled } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/setup-2fa
router.post('/setup-2fa', async (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const secret = authenticator.generateSecret();
    const otpauthPath = authenticator.keyuri(decoded.username, 'Finanzas Pro', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauthPath);

    // Temp store secret in session or handle via frontend confirm
    // For simplicity, we'll return it and expect the frontend to confirm it with a token
    res.json({ secret, qrCodeUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error setting up 2FA' });
  }
});

// POST /api/auth/enable-2fa
router.post('/enable-2fa', async (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { secret, token } = req.body;
  if (!secret || !token) return res.status(400).json({ error: 'Secret and token required' });

  try {
    const verified = authenticator.check(token, secret);
    if (!verified) return res.status(400).json({ error: 'Código inválido. Verifica tu app authenticator.' });

    const db = await getDb();
    await db.run('UPDATE users SET two_factor_secret = ?, two_factor_enabled = TRUE WHERE id = ?', [secret, decoded.id]);

    res.json({ message: '2FA activado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error enabling 2FA' });
  }
});

// POST /api/auth/disable-2fa
router.post('/disable-2fa', async (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = await getDb();
    await db.run('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?', [decoded.id]);
    res.json({ message: '2FA desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error disabling 2FA' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNew, decoded.id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
