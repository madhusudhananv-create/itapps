/**
 * AccessControl - Service for handling role-based access control
 * Migrated from Angular 6 to Angular 19
 * 
 * Migration Changes:
 * - Updated to Angular 19 inject() pattern
 * - Modernized with providedIn: 'root'
 * - Fixed HttpClient import (was HttpClientClient)
 * - Updated RxJS imports to v7+ standards
 * - Added type safety improvements
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { enumAccessType } from './enum';
import type { AppAccessControlsModel } from '../models/access-control.model';

@Injectable({
  providedIn: 'root'
})
export class AccessControl {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiurl: string = environment.webapiuri || '';
  private apiurl_auth: string = environment.webapiuri_auth || '';
  private empid: string = '';
  
  public accessControlRepository: AppAccessControlsModel[] = [];

  constructor() {
    this.empid = localStorage.getItem('empid') || '';
  }

  /**
   * Check if user is allowed to perform an action on a resource
   * @param controlId Resource/Control ID
   * @param type Access type (view, create, edit, delete)
   * @param custid Customer ID
   * @param projid Project ID
   * @returns true if allowed, false otherwise
   */
  public IsAllowed(
    controlId: number,
    type: enumAccessType,
    custid: string,
    projid: string
  ): boolean {
    if (!this.empid || this.empid === '') {
      this.empid = localStorage.getItem('empid') || '';
    }

    let allow = false;

    if (!this.accessControlRepository || this.accessControlRepository.length === 0) {
      this.accessControlRepository = this.getAccessList();
    }

    if (!this.accessControlRepository) {
      return false;
    }

    // Check for GAVS vs Customer access
    const isGAVS = this.IsGAVS();
    const role = localStorage.getItem('role');
    const logintype = localStorage.getItem('logintype');
    this.empid = this.empid.toLowerCase();

    // Customer-specific access control
    if (!isGAVS) {
      const custAccess = this.accessControlRepository.find(
        x => x.EMP_ID?.some(e => e?.toLowerCase() === this.empid) &&
             x.ACCESS_LEVEL === 3 &&
             x.RESOURCE_ID === controlId
      );

      if (custAccess) {
        allow = this.checkAccessByType(custAccess, type);
        return allow;
      }
    }

    // Role-based access with employee delegation
    let empDeligate = this.accessControlRepository.find(
      x => x.ROLE_ID?.toString() === role &&
           x.EMP_ID?.some(e => e?.toLowerCase() === this.empid) &&
           x.ACCESS_LEVEL === 1 &&
           x.RESOURCE_ID === controlId
    );

    if (!empDeligate) {
      empDeligate = this.accessControlRepository.find(
        x => x.EMP_ID?.some(e => e?.toLowerCase() === this.empid) &&
             x.ACCESS_LEVEL === 1 &&
             x.RESOURCE_ID === controlId
      );
    }

    if (empDeligate) {
      if (this.checkAccessByType(empDeligate, type)) {
        // Check customer-specific access
        if (empDeligate.CUST_ID && empDeligate.CUST_ID.length > 0) {
          allow = empDeligate.CUST_ID.some(t => t.toString() === custid.toString());
        } else {
          allow = true;
        }
      }
      return allow;
    }

    // Pure role-based access
    const userRoleId = parseInt(role || '0');
    const roleAccess = this.accessControlRepository.find(
      x => x.RESOURCE_ID === controlId && 
           x.ACCESS_LEVEL === 1 && 
           x.ROLE_ID === userRoleId &&
           this.checkAccessByType(x, type)
    );

    if (roleAccess) {
      if (roleAccess.CUST_ID && roleAccess.CUST_ID.length > 0) {
        allow = roleAccess.CUST_ID.some(t => t.toString() === custid.toString());
      } else {
        allow = true;
      }
    }

    return allow;
  }

  /**
   * Debug version of IsAllowed with logging
   */
  public IsAllowedDebug(
    controlId: number,
    type: enumAccessType,
    custid: string,
    projid: string
  ): boolean {
    return this.IsAllowed(controlId, type, custid, projid);
  }

  /**
   * Check access by type (view, create, edit, delete)
   */
  private checkAccessByType(access: AppAccessControlsModel, type: enumAccessType): boolean {
    switch (type) {
      case enumAccessType.view:
        return access.VIEW_ACCESS === true;
      case enumAccessType.create:
        return access.CREATE_ACCESS === true;
      case enumAccessType.edit:
        return access.EDIT_ACCESS === true;
      case enumAccessType.delete:
        return access.DELETE_ACCESS === true;
      default:
        return false;
    }
  }

  /**
   * Get access controls from localStorage
   */
  private getAccessList(): AppAccessControlsModel[] {
    try {
      const access = localStorage.getItem('access');
      if (access && access !== '') {
        return JSON.parse(access);
      }
    } catch (error) {
      console.error('Error parsing access controls:', error);
    }
    return [];
  }

  /**
   * Check if user is GAVS employee
   */
  private IsGAVS(): boolean {
    const logintype = localStorage.getItem('logintype');
    return logintype === 'gavs';
  }

  /**
   * Validate access and redirect if invalid
   */
  public CheckValidAccess(functionality: number): void {
    if (!this.IsAllowed(functionality, enumAccessType.view, '', '')) {
      alert('Invalid access to the URL. Redirecting to Main Dashboard!!');
      this.router.navigateByUrl('/newdashboard/custm');
    }
  }

  /**
   * Get customer-specific access controls
   */
  public GetCustomerSpecific(): void {
    if (!this.empid) {
      this.empid = localStorage.getItem('empid') || '';
    }
    // Implementation can be added as needed
  }
}
