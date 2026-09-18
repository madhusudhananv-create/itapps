import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { resolveWebApiUri } from '../utils/api-base.util';

const LOG_PREFIX = 'IT Ops Maturity Dashboard [Identity]:';

function readEmpId(row: any): string | undefined {
  return row?.empid ?? row?.EMPID ?? row?.emP_ID ?? row?.EMP_ID;
}

function readEmail(row: any): string | undefined {
  return row?.emaiL_ID ?? row?.EMAIL_ID ?? row?.email;
}

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private readonly apiurl = resolveWebApiUri();
  private myEmail$?: Observable<string | null>;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  /**
   * The CSM login session never carries the current user's email directly
   * (only empid/displayname) - resolve it from the global employee roster
   * (/EmpInfo), matching the row whose empid equals the logged-in empid.
   * This is NOT customer/account-scoped: an earlier version used
   * GetEmployeeDetailsFromCustomer, which only lists employees staffed as
   * CSM project resources on that specific customer - someone who only has
   * an IT-Ops-Maturity role (not a CSM project assignment) on an account
   * would never appear there regardless of which account was selected.
   */
  getMyEmail(): Observable<string | null> {
    if (!this.myEmail$) {
      const empId = localStorage.getItem('empid');
      this.myEmail$ = !empId
        ? of(null)
        : this.http
            .get<any[]>(`${this.apiurl}EmpInfo`, { headers: this.getHeaders() })
            .pipe(
              map((rows) => {
                const list = Array.isArray(rows) ? rows : [];
                const match = list.find((r) => String(readEmpId(r)) === String(empId));
                const email = match ? readEmail(match) : undefined;
                if (!email) {
                  console.warn(`${LOG_PREFIX} Could not resolve an email for empid=${empId} from /EmpInfo.`);
                  return null;
                }
                return email.toLowerCase();
              }),
              catchError((err) => {
                console.error(`${LOG_PREFIX} /EmpInfo failed`, err);
                return of(null);
              }),
              shareReplay({ bufferSize: 1, refCount: false }),
            );
    }
    return this.myEmail$;
  }
}
