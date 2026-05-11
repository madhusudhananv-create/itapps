/**
 * Dashboard Service - Stub
 * TODO: Full migration pending
 * 
 * This is a minimal stub to allow compilation.
 * Contains dashboard-specific utilities and state management.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Filter state properties
  public filteR_MONTH: string = '';
  public filteR_YEAR: number = 0;
  public lasT_FILTERED_MONTH: string = '';
  public lasT_FILTERED_YEAR: number = 0;
  
  // Success Goal filter properties
  public csG_FILTER_MONTH: string = '';
  public csG_FILTER_YEAR: number = 0;

  constructor() {
    console.warn('DashboardService stub initialized');
  }

  // TODO: Add dashboard-specific methods during full migration
}
