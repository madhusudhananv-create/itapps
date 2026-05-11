/**
 * AuthGuard - Route Protection Guard
 * 
 * This functional guard protects routes that require authentication.
 * Uses modern Angular 19 functional guard style instead of class-based guards.
 * 
 * Usage in routes:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MyUtility } from '../../shared/my-utility';

/**
 * Auth guard function
 * Checks if user is authenticated before allowing access to route
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const util = inject(MyUtility);

  // Check if user has valid token
  const token = authService.getToken();
  const empid = authService.getEmpId();

  if (token && empid) {
    // User is authenticated
    return true;
  }

  // User is not authenticated - save intended URL and redirect to login
  authService.saveNavigateUrl(state.url);
  router.navigateByUrl('/login');
  return false;
};

/**
 * Role-based guard factory
 * Creates a guard that checks for specific roles
 * 
 * Usage:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard(['admin', 'superadmin'])]
 * }
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const util = inject(MyUtility);

    // First check authentication
    if (!authGuard(route, state)) {
      return false;
    }

    // Check role
    const userRole = authService.getRole();
    if (userRole && allowedRoles.includes(userRole.toLowerCase())) {
      return true;
    }

    // User doesn't have required role
    util.showWarningPopup('You do not have permission to access this page', 'Access Denied');
    router.navigateByUrl('/');
    return false;
  };
}

/**
 * Login guard - prevents authenticated users from accessing login page
 * Redirects to dashboard if already logged in
 * 
 * Usage:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [loginGuard]
 * }
 */
export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Check if user is already authenticated
  const token = authService.getToken();
  const empid = authService.getEmpId();

  if (token && empid) {
    // User is already logged in - redirect to dashboard
    const session = authService.currentUser();
    if (session?.logintype === 'gavs' || session?.logintype === 'gslab') {
      router.navigateByUrl('/newdashboard/custm');
    } else if (session?.logintype === 'customer') {
      router.navigateByUrl('/newdashboard/cust');
    } else {
      router.navigateByUrl('/');
    }
    return false;
  }

  // User is not authenticated - allow access to login page
  return true;
};

/**
 * Access control guard factory
 * Creates a guard that checks for specific resource access permissions
 * 
 * Usage:
 * {
 *   path: 'projects/edit/:id',
 *   component: ProjectEditComponent,
 *   canActivate: [accessGuard(123, 'edit')] // resourceId: 123, accessType: 'edit'
 * }
 */
export function accessGuard(
  resourceId: number,
  accessType: 'view' | 'create' | 'edit' | 'delete'
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const util = inject(MyUtility);

    // First check authentication
    if (!authGuard(route, state)) {
      return false;
    }

    // Check access permission
    if (authService.hasAccess(resourceId, accessType)) {
      return true;
    }

    // User doesn't have required access
    util.showWarningPopup(`You do not have ${accessType} access to this resource`, 'Access Denied');
    router.navigateByUrl('/');
    return false;
  };
}
