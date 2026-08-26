import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Assessee } from '../models/assessee.model';
import { AccountService } from './account.service';
import { resolveWebApiUri } from '../utils/api-base.util';

const LOG_PREFIX = 'IT Ops Maturity Dashboard [Assessee]:';

function readEmpId(row: any): string | undefined {
  return row?.emP_ID ?? row?.empid ?? row?.EMP_ID;
}

function readFirstName(row: any): string | undefined {
  return row?.frsT_NM ?? row?.FRST_NM ?? row?.firstName;
}

function readRole(row: any): string | undefined {
  return row?.emP_CSP_ROLE ?? row?.EMP_CSP_ROLE ?? row?.role;
}

@Injectable({ providedIn: 'root' })
export class AssesseeService {
  private readonly apiurl = resolveWebApiUri();
  private assesseesByAccount = new Map<string, Observable<Assessee[]>>();

  /** Empty array = no assessee chosen yet for this account (mirrors the old `null` state). */
  private selectedAssesseesSubject = new BehaviorSubject<Assessee[]>([]);
  readonly selectedAssessees$ = this.selectedAssesseesSubject.asObservable();

  constructor(private http: HttpClient, private accountService: AccountService) {
    // A COE SPOC's assessee selection is persisted server-side (see
    // selectAssessees()) so it doesn't need to be re-picked on every login -
    // in particular, a Reviewer opening the same account for the first time
    // should land straight on the domain tracker/pending-review list instead
    // of an assessee picker he has no reason to fill in himself. Falls back
    // to an empty selection (picker shown) only when nothing was saved yet.
    this.accountService.selectedAccount$
      .pipe(
        switchMap((account) => {
          if (!account) return of([] as Assessee[]);
          const custId = String(account.cusT_ID);
          return forkJoin({
            savedIds: this.getSavedAssesseeIds(custId),
            assessees: this.getAssessees(custId),
          }).pipe(
            map(({ savedIds, assessees }) => {
              if (!savedIds.length) return [];
              const byId = new Map(assessees.map((a) => [a.id, a]));
              return savedIds.map((id) => byId.get(id)).filter((a): a is Assessee => !!a);
            }),
          );
        }),
      )
      .subscribe((assessees) => this.selectedAssesseesSubject.next(assessees));
  }

  private getSavedAssesseeIds(custId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiurl}GetITOpsSelectedAssessees?custId=${custId}`, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`${LOG_PREFIX} Failed to load saved assessee selection for customerId=${custId}`, err);
        return of([]);
      }),
    );
  }

  get selectedAssessees(): Assessee[] {
    return this.selectedAssesseesSubject.value;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  /**
   * Account-level endpoint (GetITOpsAssesseesForAccount) - returns everyone
   * allocated across all of this account's non-closed projects in one call.
   * Unlike the shared GetAccountAssesseeDetails, this also grants access when
   * the caller has a real IT Ops COE SPOC/Reviewer assignment on the account,
   * even if they aren't staffed on any of its projects (falls back to the
   * normal staffing-based access check for everyone else).
   */
  getAssessees(custId: string): Observable<Assessee[]> {
    if (!this.assesseesByAccount.has(custId)) {
      const result$ = this.http
        .get<any[]>(`${this.apiurl}GetITOpsAssesseesForAccount?custId=${custId}`, { headers: this.getHeaders() })
        .pipe(
          map((rows) => {
            const byId = new Map<string, Assessee>();
            for (const row of rows ?? []) {
              const id = readEmpId(row);
              const name = readFirstName(row);
              if (!id || !name || byId.has(id)) continue;
              byId.set(id, { id, name, title: readRole(row) ?? '' });
            }
            return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
          }),
          tap((list) => {
            if (!list.length) {
              console.warn(`${LOG_PREFIX} No assessees resolved for customerId=${custId} from GetAccountAssesseeDetails.`);
            }
          }),
          catchError((err) => {
            console.error(`${LOG_PREFIX} Failed to load assessees for customerId=${custId}`, err);
            return of([]);
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.assesseesByAccount.set(custId, result$);
    }
    return this.assesseesByAccount.get(custId)!;
  }

  /**
   * Replaces the full set of selected assessees for the current account
   * (multi-select) and persists the choice server-side (SaveITOpsSelectedAssessees)
   * so anyone else opening this account later - e.g. the Reviewer once a COE
   * SPOC has submitted - inherits it instead of having to pick it again.
   */
  selectAssessees(assessees: Assessee[]): void {
    const account = this.accountService.selectedAccount;
    if (!account) return;
    this.selectedAssesseesSubject.next(assessees);

    const custId = String(account.cusT_ID);
    this.http
      .post(
        `${this.apiurl}SaveITOpsSelectedAssessees`,
        { CustId: custId, AssesseeEmpIds: assessees.map((a) => a.id) },
        { headers: this.getHeaders() },
      )
      .pipe(
        catchError((err) => {
          console.error(`${LOG_PREFIX} Failed to persist assessee selection for customerId=${custId}`, err);
          return of(null);
        }),
      )
      .subscribe();
  }

  changeAssessee(): void {
    this.selectedAssesseesSubject.next([]);
  }
}
