import { Router } from 'express';
import { createHmac, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const users   = new Map(); // id -> user
const byEmail = new Map(); // email -> id

const JWT_SECRET = process.env.JWT_SECRET || 'appeally_dev_jwt_secret_2024';

function hashPassword(password) {
  return createHmac('sha256', JWT_SECRET).update(password).digest('hex');
}

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserFromReq(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = verifyToken(auth.slice(7));
  if (!payload) return null;
  return users.get(payload.id) || null;
}

// POST /api/auth/register
authRouter.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const key = email.toLowerCase().trim();
  if (byEmail.has(key))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const id = `user_${randomBytes(8).toString('hex')}`;
  const user = {
    id, name: name.trim(), email: key,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  byEmail.set(key, id);

  const { passwordHash, ...safe } = user;
  res.status(201).json({ user: safe, token: makeToken(user) });
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required.' });

  const key  = email.toLowerCase().trim();
  const id   = byEmail.get(key);
  if (!id) return res.status(401).json({ error: 'No account found with this email.' });

  const user = users.get(id);
  if (user.passwordHash !== hashPassword(password))
    return res.status(401).json({ error: 'Incorrect password.' });

  const { passwordHash, ...safe } = user;
  res.json({ user: safe, token: makeToken(user) });
});

// GET /api/auth/me
authRouter.get('/me', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});
