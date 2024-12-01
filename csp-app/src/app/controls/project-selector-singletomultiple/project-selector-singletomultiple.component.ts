
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { myUtility } from '../../Shared/myUtility';
import { CustomerProjectIds, CustomerProjectIdsSingle } from '../../models/customer-projects-model';
import { MOM_DETAIL } from '../../models/mom-details-model';
import { MatOption, MatOptionSelectionChange } from '@angular/material';

@Component({
  selector: 'app-project-selector-singletomultiple',
  templateUrl: './project-selector-singletomultiple.component.html',
  styleUrls: ['./project-selector-singletomultiple.component.scss']
})
export class ProjectSelectorSingletomultipleComponent implements OnInit {
  @Input("projId") projId: string[] = ["-1"];
  @Input("custId") custId: string = "-1";
  @Input("rowId") rowId: number;
  @Input("allcust") allcust: boolean = false;
  @Input("allproj") allproj: boolean = false;
  @ViewChild('allSelected') private allSelected: MatOption;
  clearAll: boolean = false;
  // custId: string[] = [];
  // projId: string[] = [];
  Customer = [];
  Project = [];
  dummy = []
  projectIds = [];
  // @ViewChild('allSelected') private allSelected: MatOption;
  // @ViewChild('oneSelected') private oneSelected: MatOption;
  @Output() onChange: EventEmitter<CustomerProjectIdsSingle> = new EventEmitter<CustomerProjectIdsSingle>();
  constructor(private _appservice: AppsService, public _util: myUtility, public Elementref: ElementRef, private fb: FormBuilder) { }
  searchUserForm: FormGroup;
  ngOnInit() {
    if (this.allcust == true)
      this.LoadCustomer(this.allcust);
    else
      this.LoadCustomerByEmpId();
    // this.LoadCustomer();
    this.searchUserForm = this.fb.group({
      userType: new FormControl('')
    });
  }
  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe(data => {
      this.Customer = data;
      if (this.Customer.length > 0 && this.custId != undefined) {
        this.LoadProject();
      }
      else if (this.Customer.length > 0 && this.custId != undefined) {
        this.custId = this.Customer[0].releasE_ID;
        this.LoadProject();
      }
    }, error => { this._util.serviceError(error); });
  }
  LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.Customer = data;
      if (this.Customer.length > 0 && this.custId != undefined) {
        this.LoadProject();
      }
      else if (this.Customer.length > 0 && this.custId != undefined) {
        this.custId = this.Customer[0].releasE_ID;
        this.LoadProject();
      }
    }, error => { this._util.serviceError(error); });
  }
  tosslePerOne(all) {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.searchUserForm.controls.userType.value.length == this.Project.length)
    {
      if(this.allSelected != undefined)
            this.allSelected.select();
    }
    this.emitChanges()
  }
  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.searchUserForm.controls.userType
        .patchValue([...this.Project.map(item => item.proJ_ID), 0]);
    } else {
      this.searchUserForm.controls.userType.patchValue([]);
    }
    this.emitChanges()
  }

  ddCustomer_Onchange(event) {
    this.LoadProject();
    if(this.allSelected != undefined)
          this.allSelected.deselect();
    this.searchUserForm.controls.userType.patchValue([])
  }


  LoadProject() {
    this._appservice.GetMultipleCustomersProjectNamesSingle(this.custId, this.allproj).subscribe(data => {
      this.Project = data;    
      
      const firstelement = 0;
     
      this.projectIds = [firstelement].concat(this.Project.map(x=>x.proJ_ID));
      this.emitChanges();
    }, error => { this._util.serviceError(error); });
  }
  emitChanges() {
    let str: CustomerProjectIdsSingle = new CustomerProjectIdsSingle();
    str.customer = this.custId;
    str.project = this.searchUserForm.controls.userType.value
    str.rowId = this.rowId;
    this.onChange.emit(str);
  }
}
