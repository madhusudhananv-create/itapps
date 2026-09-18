import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
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

  getAccounts(): Observable<CustomerModel[]> {
    if (!this.accounts$) {
      // The shell app caches the logged-in user's account list in localStorage
      // right after login (shared across tabs on the same origin) - reuse it
      // the same way the shell's own "All Customers" dropdown does, instead of
      // re-querying the API (which the shell itself only does as a fallback).
      const cached = this.readCachedAccounts();
      if (cached) {
        this.accounts$ = of(cached).pipe(tap((accounts) => this.preselectFromUrl(accounts)));
      } else {
        const empId = localStorage.getItem('empid');
        if (!empId) {
          this.accounts$ = of([]);
        } else {
          this.accounts$ = this.http
            .get<CustomerModel[]>(`${this.apiurl}GetCustomerIds?EmpId=${empId}&istoFindSLA=false`, {
              headers: this.getHeaders(),
            })
            .pipe(
              catchError((err) => {
                console.error('IT Ops Maturity Dashboard: failed to load accounts from GetCustomerIds', err);
                return of([]);
              }),
              tap((accounts) => this.preselectFromUrl(accounts)),
              shareReplay({ bufferSize: 1, refCount: false }),
            );
        }
      }
    }
    return this.accounts$;
  }

  private readCachedAccounts(): CustomerModel[] | null {
    try {
      const raw = localStorage.getItem('CustomerIds');
      if (!raw || !raw.trim()) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch {
      return null;
    }
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
