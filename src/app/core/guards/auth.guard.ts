import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const resolveExpectedRole = (route: ActivatedRouteSnapshot | null): string | undefined => {
  let current = route;
  while (current) {
    const role = current.data['role'];
    if (role) return role as string;
    current = current.parent;
  }
  return undefined;
};

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expectedRole = resolveExpectedRole(route);
  const user = auth.getCurrentUser();

  if (user && (!expectedRole || user.role === expectedRole)) {
    return true;
  }

  if (!user && expectedRole) {
    const demoUser = auth.getDemoUserForRole(expectedRole as 'Student' | 'Company' | 'Placement' | 'Admin');
    if (demoUser) {
      auth.setCurrentUser(demoUser);
      return true;
    }
  }

  return router.createUrlTree(['/login']);
};
