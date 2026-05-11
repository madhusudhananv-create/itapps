import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../my-utility';

/**
 * Project Selector Component
 * Reusable component for selecting customer and project
 * 
 * Features:
 * - Customer dropdown with search
 * - Project dropdown with search (filtered by customer)
 * - Support for all customers or user-specific customers
 * - Support for all projects or user-specific projects
 * - Emit changes when selection changes
 */
@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit, OnChanges {
  @Input() custId: string = '';
  @Input() projId: string = '';
  @Input() custNM: string = '';
  @Input() projNM: string = '';
  @Input() allcust: boolean = false;
  @Input() allproj: boolean = false;
  @Input() skipNonAuditProjects: boolean = false;
  @Input() disabled: boolean = false;
  
  Customer: any[] = [];
  Project: any[] = [];
  SkipAuditProjects: any[] = [];
  settingValue: any;
  searchValueCUST: string = "";
  searchValuePJT: string = "";
  MasterCustomer: any[] = [];
  MasterProjectList: any[] = [];

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private _appservice: AppsService,
    public _util: MyUtility
  ) { }

  ngOnInit() {
    if (this.allcust == true)
      this.LoadCustomer(this.allcust);
    else {
      this.LoadCustomerByEmpId();
    }
    this.loadProjectDataConfigurationValues();
  }

  ngOnChanges() {
    // Only load projects if custId is valid
    if (this.custId && this.custId !== '' && this.custId !== '&' && this.custId !== 'undefined' && this.custId !== 'null') {
      this.LoadProject(this.custId, this.allproj);
    }
  }

  ddCustomer_Onchange() {
    // Clear project selection when customer changes
    this.projId = '';
    this.LoadProject(this.custId, this.allproj);
  }

  ddProject_Onchange() {
    this.emitChanges();
  }

  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe({
      next: (data) => {
        this.Customer = data;
        this.MasterCustomer = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  LoadCustomerByEmpId() {
    this._appservice.getCustomerList(localStorage.getItem('empid') || '', false).subscribe({
      next: (data) => {
        this.Customer = data;
        this.MasterCustomer = data;
        // Only load projects if custId is valid
        if (this.custId && this.custId !== '' && this.custId !== '&' && this.custId !== 'undefined' && this.custId !== 'null') {
          this.LoadProject(this.custId, this.allproj);
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  loadProjectDataConfigurationValues() {
    this.settingValue = 'SKIP_INTERNAL_AUDIT';
    this._appservice.GetProjectDataConfigurationValues(this.settingValue, this.custId, this.projId).subscribe({
      next: (data) => {
        this.SkipAuditProjects = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  LoadProject(custId: string, allproj: boolean) {
    // Validate custId is not undefined, null, empty string, or '&'
    if (!custId || custId === '' || custId === '&' || custId === 'undefined' || custId === 'null') {
      console.warn('LoadProject called with invalid custId:', custId);
      return;
    }
    this._appservice.GetCustomerProjectsName(custId, allproj || this._util.ShouldLoadAllProjects()).subscribe({
      next: (data) => {
        this.Project = data;
        this.MasterProjectList = data;
        if (this.skipNonAuditProjects && this.SkipAuditProjects != undefined
          && this.SkipAuditProjects != null && this.SkipAuditProjects.length > 0) {
          for (var i = 0; i < this.SkipAuditProjects.length; i++) {
            this.Project = this.Project.filter((x: any) => x.proJ_ID != this.SkipAuditProjects[i]);
            this.MasterProjectList = this.Project;
          }
          this.loadProjectChanges();
        }
        else {
          this.Project = data;
          this.MasterProjectList = data;
          this.loadProjectChanges();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  loadProjectChanges() {
    if (this.Project.length > 0 && this.projId != undefined && this.projId != '') {
      let bFound: boolean = false;
      for (let a of this.Project) {
        if (a.proJ_ID === this.projId) {
          bFound = true;
          break;
        }
      }
      if (!bFound) {
        this.projId = '';
        this.custId = '';
      }
      this.emitChanges();
    }
    // Removed auto-selection of first project to prevent default selection
    // else if (this.Project.length > 0) {
    //   this.projId = this.Project[0].proJ_ID;
    //   this.emitChanges();
    // }
  }

  emitChanges() {
    let customer = this.Customer.filter((item: any) => item.cusT_ID === this.custId);
    let project = this.Project.filter((item: any) => item.proJ_ID === this.projId);
    if (customer != null && customer != undefined && customer.length > 0)
      this.custNM = customer[0].cusT_NM;
    if (project != null && project != undefined && project.length > 0)
      this.projNM = project[0].proJ_NM;
    this.onChange.emit('{"customer": "' + this.custId + '", "project": "' + this.projId + '", "customerName": "' + this.custNM + '", "projectName": "' + this.projNM.trim() + '"}');
  }

  openedChangeSPAL(opened: boolean) {
    this.searchValueCUST = "";
    this.applyFilterForCustomer(this.searchValueCUST);
  }

  applyFilterForCustomer(filterValue: string) {
    this.Customer = this.MasterCustomer.filter((p: any) => p.cusT_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangePJT(opened: boolean) {
    this.searchValuePJT = "";
    this.applyFilterForProject(this.searchValuePJT);
  }

  applyFilterForProject(filterValue: string) {
    this.Project = this.MasterProjectList.filter((p: any) => p.proJ_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }
}
