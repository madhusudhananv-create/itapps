import { Injectable } from '@angular/core';

/**
 * SharedData - Service for shared application data
 * Migrated from Angular 6 to Angular 19
 * 
 * Migration Changes:
 * - Added @Injectable decorator with providedIn: 'root'
 * - Converted from singleton pattern to Angular service
 * - Added type safety
 * - Using strict null checks
 */

@Injectable({
  providedIn: 'root'
})
export class SharedData {
  public slaAvailableList: any[] = [];
  public selectedPortfolios: number[] = [];
  public selectedProjects: string[] = [];
  public selectedProducts: number[] = [];
  public isKPIEdit: boolean = false;
  public savedportfolioId: number = 0;

  constructor() {
    // Service is now provided at root level
  }

  /**
   * Clear all shared data
   */
  public clear(): void {
    this.slaAvailableList = [];
    this.selectedPortfolios = [];
    this.selectedProjects = [];
    this.selectedProducts = [];
    this.isKPIEdit = false;
    this.savedportfolioId = 0;
  }
}
