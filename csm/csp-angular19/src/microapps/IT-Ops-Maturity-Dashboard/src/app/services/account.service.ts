import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomerModel } from '../models/account.model';
import { resolveWebApiUri } from '../utils/api-base.util';

const STORAGE_KEY = 'it-ops-maturity.selected-account';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly apiurl = resolveWebApiUri();

  private accounts$?: Observable<CustomerModel[]>;
  private selectedAccountSubject = new BehaviorSubject<CustomerModel | null>(this.loadStoredAccount());
  readonly selectedAccount$ = this.selectedAccountSubject.asObservable();

  constructor(private http: HttpClient) {}

  get selectedAccount(): CustomerModel | null {
    return this.selectedAccountSubject.value;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  private loadStoredAccount(): CustomerModel | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * IT Ops Maturity assigns COE SPOC/Reviewer per domain per account,
   * independently of a person's project staffing/allocation - so the account
   * picker here always lists every account in the system (GetITOpsAllAccounts),
   * regardless of who is logged in, rather than scoping to what that person
   * happens to be staffed or IT-Ops-assigned on.
   */
  getAccounts(): Observable<CustomerModel[]> {
    if (!this.accounts$) {
      this.accounts$ = this.http.get<CustomerModel[]>(`${this.apiurl}GetITOpsAllAccounts`, { headers: this.getHeaders() }).pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load accounts from GetITOpsAllAccounts', err);
          return of([]);
        }),
        tap((accounts) => this.preselectFromUrl(accounts)),
      );
    }
    return this.accounts$;
  }

  private preselectFromUrl(accounts: CustomerModel[]): void {
    if (this.selectedAccountSubject.value) return;
    const custId = new URLSearchParams(window.location.search).get('custId');
    if (!custId) return;
    const match = accounts.find((a) => String(a.cusT_ID) === String(custId));
    if (match) this.selectAccount(match);
  }

  selectAccount(account: CustomerModel): void {
    this.selectedAccountSubject.next(account);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    } catch {
      /* ignore */
    }
  }

  clearSelectedAccount(): void {
    this.selectedAccountSubject.next(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
