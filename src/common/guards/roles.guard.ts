import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userRoles = Array.isArray(user?.roles)
      ? user.roles
      : [user?.role].filter(Boolean);

    return requiredRoles.some((role) =>
      userRoles.some((userRole) =>
        String(userRole).toLowerCase() === String(role).toLowerCase(),
      ),
    );
  }
}
