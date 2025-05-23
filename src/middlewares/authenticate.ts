import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends DefaultJwtPayload {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
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
  console.log(req.cookies);
  console.log(token);
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
    console.log("token:", token);
    console.log("Decoded token:", jwt.decode(token));
    // Optional: check if decoded has `id` just to be safe
    if (!decoded.id) {
      res.status(403).json({ message: 'Invalid token payload' });
      return;
    }

    req.user = decoded;
    console.log("ASDASD", req.user);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token', error: err });
    return;
  }
}
