// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: import('../middlewares/authenticate').CustomJwtPayload;
  }
}