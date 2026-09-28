import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { resolveWebApiUri } from '../utils/api-base.util';

export interface ItOpsNotification {
  id: number;
  notificationType: string;
  message: string;
  assessmentId: number | null;
  findingId: number | null;
  domainId: number | null;
  domainCode: string | null;
  domainName: string | null;
  custId: string | null;
  accountName: string | null;
  createdDate: string;
}

const LOG_PREFIX = 'IT Ops Maturity Dashboard [Notifications]:';

/**
 * Backs the notification bell shown for every role (COE SPOC, Reviewer,
 * Assessee) - all read from the same ITOPS_NOTIFICATION log, populated by the
 * backend whenever a submit/review/finding-decision/approval event fires
 * (see ITOperationMaturityController.NotifyITOps).
 */
@Injectable({ providedIn: 'root' })
export class ItOpsNotificationApiService {
  private readonly apiurl = resolveWebApiUri();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  getMyNotifications(empId: string): Observable<ItOpsNotification[]> {
    return this.http.get<ItOpsNotification[]>(`${this.apiurl}GetITOpsMyNotifications?empId=${empId}`, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`${LOG_PREFIX} Failed to load notifications`, err);
        return of([]);
      }),
    );
  }

  dismiss(id: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}DismissITOpsNotification?id=${id}`, null, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`${LOG_PREFIX} Failed to dismiss notification ${id}`, err);
        return of(null);
      }),
    );
  }

  dismissAll(empId: string): Observable<unknown> {
    return this.http.post(`${this.apiurl}DismissAllITOpsNotifications?empId=${empId}`, null, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`${LOG_PREFIX} Failed to dismiss all notifications`, err);
        return of(null);
      }),
    );
  }
}
