/**
 * SharedService - Shared service for cross-component communication
 * Migrated from Angular 6 to Angular 19
 * 
 * Migration Changes:
 * - Updated to Angular 19 patterns
 * - Added type safety
 * - Modern RxJS Subject patterns
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Method call observable for cross-component communication
  private methodCallSource = new Subject<void>();
  methodCalled$ = this.methodCallSource.asObservable();

  // Portfolio and project selection state
  public savedportfolioId = 0;
  public selectedPortfolios: number[] = [];
  public selectedProjects: string[] = [];
  public selectedProducts: number[] = [];

  // EWS Component changes
  public cooselectedProjects: string[] = [];
  public AllAccounts = false;
  public SelectedCustID = '';
  public selectedCustIDarray: string[] = [];
  public SelectedQuarter = 0;
  public StartDate: Date | null = null;
  public EndDate: Date | null = null;
  public SelectedYear = 0;

  constructor() {}

  /**
   * Trigger method call event
   */
  public callMethod(): void {
    this.methodCallSource.next();
  }

  /**
   * Clear all selections
   */
  public clearSelections(): void {
    this.selectedPortfolios = [];
    this.selectedProjects = [];
    this.selectedProducts = [];
    this.cooselectedProjects = [];
    this.selectedCustIDarray = [];
  }
}
