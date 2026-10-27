import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
  duration: number;
}

let nextId = 1;

/**
 * App-wide toast notifications (mounted once via <app-toast/> in AppComponent).
 * Replaces the old pattern of a small inline "Draft saved." text next to the
 * action buttons, which was easy to miss and gave no feedback at all on the
 * Review/Findings pages.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  show(title: string, detail?: string, kind: ToastKind = 'success', duration = 4200): void {
    const toast: ToastMessage = { id: nextId++, kind, title, detail, duration };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
  }

  success(title: string, detail?: string): void {
    this.show(title, detail, 'success');
  }

  info(title: string, detail?: string): void {
    this.show(title, detail, 'info');
  }

  error(title: string, detail?: string): void {
    this.show(title, detail, 'error', 6000);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
