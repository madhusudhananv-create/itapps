import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { resolveWebApiUri } from '../utils/api-base.util';

const UNKNOWN_BU = 'Unknown';
const LOG_PREFIX = 'IT Ops Maturity Dashboard [BusinessUnit]:';

/**
 * Mirrors the shell app's own "All Business Units" dropdown
 * (dashboard-customer-multiple.component.ts loadProjectBUMapping / onBUChange):
 * GetBusinessUnits returns per-project rows that already carry both the
 * customer id and the BU name directly - no separate id->name lookup, and no
 * join against GetAllProjectsForCustomer needed.
 */
function readCustId(project: any): string | undefined {
  return project?.cusT_ID ?? project?.CUST_ID ?? project?.custId ?? project?.customerId;
}

function readBuName(project: any): string | undefined {
  return project?.BUSINESS_UNIT ?? project?.businesS_UNIT ?? project?.bU_NM ?? project?.businessUnit;
}

@Injectable({ providedIn: 'root' })
export class BusinessUnitService {
  private readonly apiurl = resolveWebApiUri();
  private buMapping$?: Observable<Map<string, string>>;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  getBusinessUnitForAccount(custId: string): Observable<string> {
    return this.getCustomerBuMapping().pipe(map((mapping) => mapping.get(String(custId)) ?? UNKNOWN_BU));
  }

  private getCustomerBuMapping(): Observable<Map<string, string>> {
    if (!this.buMapping$) {
      this.buMapping$ = this.http
        .get<any>(`${this.apiurl}/GetBusinessUnits`, { headers: this.getHeaders() })
        .pipe(
          map((res) => {
            const rows: any[] = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const mapping = new Map<string, string>();
            for (const row of rows) {
              const custId = readCustId(row);
              const buName = readBuName(row);
              if (custId !== undefined && buName) mapping.set(String(custId), String(buName));
            }
            if (!mapping.size) {
              console.warn(`${LOG_PREFIX} GetBusinessUnits returned data but no rows had a recognizable cusT_ID/businesS_UNIT shape. Raw sample:`, rows?.[0]);
            }
            return mapping;
          }),
          catchError((err) => {
            console.error(`${LOG_PREFIX} GetBusinessUnits failed`, err);
            return of(new Map<string, string>());
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.buMapping$;
  }
}
