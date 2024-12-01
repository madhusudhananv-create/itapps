import { Component, OnInit, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EmpInfoModel } from '../../models/emp-info-model';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Output } from '@angular/core';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'app-employee-search',
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.scss']
})
export class EmployeeSearchComponent implements OnInit {
  @Input("emP_ID") emP_ID: string;
  @Input("emp_name_readOnly") emp_name_readOnly;
  @Input("emP_Name") emP_Name;
  @Input("multiSelect") multiSelect;

  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  masterEmpInfo: EmpInfoModel[] = [];
  filteredOptions: Observable<EmpInfoModel[]>;
  @ViewChild('searchInput') searchInput: ElementRef;
  selectedEmployee: any = [];
  searchVal: string;

  constructor(public _util: myUtility, public _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | EmpInfoModel>(''),
        map(value => typeof value === 'string' ? value : value.frsT_NM),
        map(name => name ? this._filter(name) : this.empinfo.slice())
      );
  }
  @Output() onChange: EventEmitter<EmpInfoModel> = new EventEmitter<EmpInfoModel>();
  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();
    let emp = this.empinfo.filter(option => option.frsT_NM.toLowerCase().includes(filterValue));
    this.emitChanges()
    return emp;
  }

  displayFn(user?: EmpInfoModel): string | undefined {
    return user ? user.frsT_NM : undefined;
  }

  ngOnChanges() {

  }

  LoadData() {
    this.service_GetEmpInfo();
  }
  service_GetEmpInfo() {
    this._appservice.getEmpInfo().subscribe(data => {
      this.empinfo = data;
      this.masterEmpInfo = data;
      let empRec = this.empinfo.find(x => x.emP_ID == this.emP_Name)
      if (empRec != null)
        this.myControl.setValue(empRec);
      if (this.multiSelect && data != null && data != undefined && data.length > 0)
        this.selectedEmployee = this.emP_Name;
    }, error => { this._util.serviceError(error); });
  }

  emitChanges() {
    if (this.myControl.value.emP_ID != undefined)
      this.onChange.emit(this.myControl.value.emP_ID);
  }

  selectedEmployees() {
    this.onChange.emit(this.selectedEmployee);
  }

  onDropdownOpenedChanged(opened: boolean) {
    if (opened) {
      this.searchVal = "";
      this.SearchKey(this.searchVal);
    }
  }

  onKey(value) {
    this.empinfo = this.SearchKey(value);
  }

  SearchKey(value: string) {
    if (!value) {
      this.empinfo = this.masterEmpInfo;
      return this.empinfo;
    }
    else {
      if (this.masterEmpInfo != null && this.masterEmpInfo != undefined && this.masterEmpInfo.length > 0) {
        let empData = this.masterEmpInfo.filter(item => this.selectedEmployee.some(x => x == item.emP_ID) ||
          item.frsT_NM.toLowerCase().includes(value.toLowerCase()));
        return empData;
      }
    }
  }


}
