import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends DefaultJwtPayload {
  id: string;
  email?: string;
}

// Optional: Keep AuthenticatedRequest for type safety in route handlers
export interface AuthenticatedRequest extends Request {
  user?: CustomJwtPayload;
}

export default function authenticate(
  req: Request, // explicitly use AuthenticatedRequest here
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    // Optional: check if decoded has `id` just to be safe
    if (!decoded.id) {
      res.status(403).json({ message: 'Invalid token payload' });
      return; 
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
    return; 
  }
}