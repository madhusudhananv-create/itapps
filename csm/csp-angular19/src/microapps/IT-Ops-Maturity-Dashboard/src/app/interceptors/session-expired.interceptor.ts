import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Every API call in this microapp reads its auth token straight out of
 * localStorage (see itops-*-api.service.ts's getHeaders()) - it's whatever
 * the CSM shell wrote there at login, never refreshed by this app itself.
 * Once the shell's own session times out, that token goes stale and every
 * call here starts failing with 401 - which each component's own catchError
 * then reported as a generic, misleading message ("Could not create the
 * cycle. Please try again.") with no indication the real problem is that the
 * user needs to log back in. A retry just fails again the same way.
 *
 * This intercepts any 401 first: it clears the stale session and sends the
 * user back to the shell's login page (same redirect nav-menu.component.ts's
 * own logout() already uses), so a timed-out session reads as "you were
 * logged out, please log back in" instead of an unexplained save failure.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return throwError(() => err);
    }),
  );
};
