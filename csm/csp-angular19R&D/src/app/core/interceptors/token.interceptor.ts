/**
 * Token Interceptor - Angular 19 Functional Interceptor
 * Migrated from LEGACY-SOURCE token-interceptor.ts
 * 
 * Adds authentication headers to all HTTP requests:
 * - Accept: application/json
 * - token: User authentication token
 * - empId: Employee ID from localStorage
 */

import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepts all HTTP requests and adds authentication headers
 * This is a functional interceptor (Angular 15+) replacing the old class-based interceptor
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token and empId from localStorage
  const token = localStorage.getItem('token') || '';
  const empId = localStorage.getItem('empid') || '';

  // Clone the request and SET headers (preserving any existing headers)
  const modifiedReq = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'token': token,
      'empId': empId
    }
  });

  // Pass the cloned request to the next handler
  return next(modifiedReq);
};
