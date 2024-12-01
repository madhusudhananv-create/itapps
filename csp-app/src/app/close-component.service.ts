import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloseComponentService {
  private subjectReload = new Subject<any>();

  sendUpdate() {
    this.subjectReload.next();
  }

  getUpdate(): Observable<any> {
    return this.subjectReload.asObservable();
  }
}