import { Injectable } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

/**
 * Process Model Service
 * Manages process model state and operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessModelService {
  stepper!: MatStepper;
  checklists: any[] = [];

  constructor() {}
}
