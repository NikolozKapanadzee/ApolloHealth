import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/interfaces/auth.interface';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.user?.id;
  },
);
