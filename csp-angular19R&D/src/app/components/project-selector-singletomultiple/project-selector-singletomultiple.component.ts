import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';

import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { CustomerProjectIdsSingle } from '../../models/customer-projects.model';

/**
 * Project Selector Single to Multiple Component
 * Allows selection of one customer and multiple projects
 * Used in CI Leaderboard and other pages
 * 
 * Features:
 * - Customer dropdown (single selection)
 * - Project dropdown (multiple selection)
 * - "All" option for projects
 * - Auto-load projects when customer changes
 * - Emit onChange event with selected values
 * 
 * Migrated from Angular 6 to Angular 19
 */
@Component({
  selector: 'app-project-selector-singletomultiple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './project-selector-singletomultiple.component.html',
  styleUrls: ['./project-selector-singletomultiple.component.scss']
})
export class ProjectSelectorSingletomultipleComponent implements OnInit {
  @Input("projId") projId: string[] = ["-1"];
  @Input("custId") custId: string = "-1";
  @Input("rowId") rowId: number = 0;
  @Input("allcust") allcust: boolean = false;
  @Input("allproj") allproj: boolean = false;
  @ViewChild('allSelected') allSelected!: MatOption;
  
  clearAll: boolean = false;
  Customer: any[] = [];
  Project: any[] = [];
  dummy: any[] = [];
  projectIds: any[] = [];
  searchUserForm!: FormGroup;

  @Output() onChange: EventEmitter<CustomerProjectIdsSingle> = new EventEmitter<CustomerProjectIdsSingle>();

  constructor(
    private _appservice: AppsService,
    public _util: MyUtility,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    if (this.allcust == true) {
      this.LoadCustomer(this.allcust);
    } else {
      this.LoadCustomerByEmpId();
    }

    this.searchUserForm = this.fb.group({
      userType: new FormControl('')
    });
  }

  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe(
      (data: any) => {
        this.Customer = data;
        if (this.Customer.length > 0 && this.custId != undefined) {
          this.LoadProject();
        } else if (this.Customer.length > 0 && this.custId != undefined) {
          this.custId = this.Customer[0].cusT_ID;
          this.LoadProject();
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid') || '', false).subscribe(
      (data: any) => {
        this.Customer = data;
        if (this.Customer.length > 0 && this.custId != undefined) {
          this.LoadProject();
        } else if (this.Customer.length > 0 && this.custId != undefined) {
          this.custId = this.Customer[0].cusT_ID;
          this.LoadProject();
        }
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  tosslePerOne(all: any) {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.searchUserForm.controls['userType'].value.length == this.Project.length) {
      if (this.allSelected != undefined) {
        this.allSelected.select();
      }
    }
    this.emitChanges();
    return true;
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.searchUserForm.controls['userType']
        .patchValue([...this.Project.map((item: any) => item.proJ_ID), 0]);
    } else {
      this.searchUserForm.controls['userType'].patchValue([]);
    }
    this.emitChanges();
  }

  ddCustomer_Onchange(event: any) {
    this.LoadProject();
    if (this.allSelected != undefined) {
      this.allSelected.deselect();
    }
    this.searchUserForm.controls['userType'].patchValue([]);
  }

  LoadProject() {
    this._appservice.GetMultipleCustomersProjectNamesSingle(this.custId, this.allproj).subscribe(
      (data: any) => {
        this.Project = data;

        const firstelement = 0;
        this.projectIds = [firstelement].concat(this.Project.map((x: any) => x.proJ_ID));
        this.emitChanges();
      },
      (error: any) => {
        this._util.serviceError(error);
      }
    );
  }

  emitChanges() {
    let str: CustomerProjectIdsSingle = new CustomerProjectIdsSingle();
    str.customer = this.custId;
    str.project = this.searchUserForm.controls['userType'].value;
    str.rowId = this.rowId;
    this.onChange.emit(str);
  }
}
