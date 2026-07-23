import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleContextService {
  private readonly roleSubject = new BehaviorSubject<string>('BCP Coordinator');

  public readonly role$: Observable<string> = this.roleSubject.asObservable();

  setRole(role: string): void {
    if (role && role !== this.roleSubject.value) {
      this.roleSubject.next(role);
    }
  }

  getRole(): string {
    return this.roleSubject.value;
  }
}


