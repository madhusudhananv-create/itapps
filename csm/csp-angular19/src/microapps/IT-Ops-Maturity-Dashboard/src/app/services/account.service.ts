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
    const custId = this.readCustIdFromUrl();
    if (!custId) return;
    // A custId in the URL (e.g. a notification-email deep link) always wins over whatever
    // account happens to already be stored from a previous session - otherwise a recipient
    // who last viewed a different account gets sent straight to "Domain not found" instead
    // of the account/domain the email was actually about.
    if (this.selectedAccountSubject.value && String(this.selectedAccountSubject.value.cusT_ID) === String(custId)) return;
    const match = accounts.find((a) => String(a.cusT_ID) === String(custId));
    if (match) this.selectAccount(match);
  }

  /**
   * custId can arrive either in location.search (?custId=... before the #) or inside the
   * hash-routed query string (#/review/domain?assessmentId=1&custId=...) - checked in that
   * order, hash last. UAT/prod IIS has a canonical-URL redirect that strips a request's
   * explicit "index.html" AND its query string, but a browser always re-attaches the
   * original fragment onto a redirect target that carries none of its own - so a custId
   * placed before the # can get silently dropped there while the same value after the #
   * survives untouched. GetITOpsAssessmentLink (backend) puts it after the # for exactly
   * this reason; location.search is still checked first for any other caller that isn't
   * subject to that redirect (e.g. the navbar's own "open in new tab" link).
   */
  private readCustIdFromUrl(): string | null {
    const fromSearch = new URLSearchParams(window.location.search).get('custId');
    if (fromSearch) return fromSearch;

    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;
    return new URLSearchParams(hash.substring(queryIndex + 1)).get('custId');
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
