import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to handle menu toggle communication between navbar and dashboard components
 * Uses RxJS Subject to emit and subscribe to menu toggle events
 */
@Injectable({
  providedIn: 'root'
})
export class MenuToggleService {
  private menuToggleSubject = new Subject<boolean>();
  
  // Observable stream for components to subscribe
  menuToggle$ = this.menuToggleSubject.asObservable();

  /**
   * Emit menu toggle event
   * @param value Menu toggle status (true = show, false = hide)
   */
  toggleMenu(value: boolean): void {
    this.menuToggleSubject.next(value);
  }
}
