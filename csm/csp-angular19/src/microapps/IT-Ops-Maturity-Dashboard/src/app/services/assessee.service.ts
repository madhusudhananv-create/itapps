import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Assessee } from '../models/assessee.model';
import { AccountService } from './account.service';
import { resolveWebApiUri } from '../utils/api-base.util';

const STORAGE_KEY = 'it-ops-maturity.assessee-by-account';
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
    // Every account selection (including re-selecting the same one) always
    // lands on the assessee picker - it's never auto-skipped from a
    // previously remembered choice. "Change assessee" reuses this same reset.
    this.accountService.selectedAccount$.subscribe(() => this.selectedAssesseesSubject.next([]));
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
   * Account-level endpoint (GetAccountAssesseeDetails) - returns everyone
   * allocated across all of this account's non-closed projects in one call,
   * without requiring the calling employee to be staffed on every project.
   */
  getAssessees(custId: string): Observable<Assessee[]> {
    if (!this.assesseesByAccount.has(custId)) {
      const result$ = this.http
        .get<any[]>(`${this.apiurl}GetAccountAssesseeDetails?CustomerId=${custId}`, { headers: this.getHeaders() })
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

  /** Replaces the full set of selected assessees for the current account (multi-select). */
  selectAssessees(assessees: Assessee[]): void {
    const account = this.accountService.selectedAccount;
    if (!account) return;
    const map = this.loadMap();
    map[String(account.cusT_ID)] = assessees.map((a) => a.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* ignore */
    }
    this.selectedAssesseesSubject.next(assessees);
  }

  changeAssessee(): void {
    this.selectedAssesseesSubject.next([]);
  }

  private loadMap(): Record<string, string[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Migrate the old single-id-per-account shape transparently.
      const normalized: Record<string, string[]> = {};
      for (const [custId, value] of Object.entries(parsed)) {
        normalized[custId] = Array.isArray(value) ? (value as string[]) : [value as string];
      }
      return normalized;
    } catch {
      return {};
    }
  }
}
