import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
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

  private selectedAssesseeSubject = new BehaviorSubject<Assessee | null>(null);
  readonly selectedAssessee$ = this.selectedAssesseeSubject.asObservable();

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.selectedAccount$
      .pipe(
        switchMap((account) => {
          if (!account) return of(null);
          const custId = String(account.cusT_ID);
          const storedId = this.loadMap()[custId];
          if (!storedId) return of(null);
          return this.getAssessees(custId).pipe(map((list) => list.find((a) => a.id === storedId) ?? null));
        }),
      )
      .subscribe((assessee) => this.selectedAssesseeSubject.next(assessee));
  }

  get selectedAssessee(): Assessee | null {
    return this.selectedAssesseeSubject.value;
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

  selectAssessee(assessee: Assessee): void {
    const account = this.accountService.selectedAccount;
    if (!account) return;
    const map = this.loadMap();
    map[String(account.cusT_ID)] = assessee.id;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* ignore */
    }
    this.selectedAssesseeSubject.next(assessee);
  }

  changeAssessee(): void {
    this.selectedAssesseeSubject.next(null);
  }

  private loadMap(): Record<string, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
