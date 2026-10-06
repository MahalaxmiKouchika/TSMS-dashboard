import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vidyavikas_secret_key_2026';

export interface AdminAuthRequest extends Request {
  admin?: {
    id: number;
    admin_identifier: string;
  };
}

export function verifyAdminToken(req: AdminAuthRequest, res: Response, next: NextFunction) {
  let token = '';
  
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith('admin_token=')) {
        token = c.split('=')[1];
      }
    }
  }

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; admin_identifier: string };
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
}
