import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { COMMON_MESSAGES } from '../common/constants/common.constants';

@Injectable()
export class IsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException(COMMON_MESSAGES.TOKEN.NO_TOKEN);
    }
    try {
      const payload = this.jwtService.verify(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      throw new UnauthorizedException(
        COMMON_MESSAGES.TOKEN.INVALID_OR_EXPIRED_TOKEN,
      );
    }
    return true;
  }
  private getTokenFromHeaders(headers: Record<string, string | undefined>) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
