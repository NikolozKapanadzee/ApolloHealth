import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const userId = ctx.switchToHttp().getRequest().user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  },
);
