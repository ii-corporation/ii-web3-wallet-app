import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserData } from '../interfaces';

export { CurrentUserData };

/**
 * Decorator to extract the current user from the request
 * Use with @UseGuards(JwtAuthGuard)
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUserData) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
