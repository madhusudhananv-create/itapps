/**
 * Access Control Service - Migrated from legacy accessControl.ts
 * Modernized for Angular 19 with type safety
 */

import { Injectable } from '@angular/core';

export interface AccessControlModel {
  empId: string;
  canEdit: boolean;
  role: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  
  /**
   * Check if user has edit access
   */
  public canEdit(): boolean {
    const canEdit = localStorage.getItem('canedit');
    return canEdit === 'true';
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: string): boolean {
    const role = localStorage.getItem('role');
    // Add permission logic based on role
    return role !== null && role !== '';
  }

  /**
   * Get current user role
   */
  public getUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  /**
   * Set edit access
   */
  public setEditAccess(canEdit: boolean): void {
    localStorage.setItem('canedit', canEdit.toString());
  }

  /**
   * Check if user is allowed to perform an action
   * Simplified version - full implementation with access control repository needed later
   * @param controlId - Resource/control ID
   * @param type - Access type (1=view, 2=create, 3=edit, 4=delete)
   * @param custid - Customer ID
   * @param projid - Project ID
   */
  public IsAllowed(controlId: number, type: number, custid: string, projid: string): boolean {
    // Simplified implementation - always allow for now
    // TODO: Implement full access control logic with accessControlRepository
    // This should check against AppAccessControlsModel array from utility service
    return true;
  }
}
