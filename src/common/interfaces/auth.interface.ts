import { Request } from 'express';
import { UserRole } from '../enums/UserRole.enum';

export interface JwtPayload {
  sub: number;
  role: UserRole;
}

export interface AuthUser {
  id: number;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
