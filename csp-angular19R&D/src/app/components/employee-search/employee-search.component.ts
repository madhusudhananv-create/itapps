import { Component, OnInit, EventEmitter, Input, ViewChild, ElementRef, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material imports
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// Models and Services
import { EmpInfoModel } from '../../models/emp-info-model';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.scss']
})
export class EmployeeSearchComponent implements OnInit, OnChanges {
  @Input() emP_ID: string = '';
  @Input() emp_name_readOnly: boolean = false;
  @Input() emP_Name: string = '';
  @Input() multiSelect: boolean = false;
  @Input() searchText: string = '';

  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  myControl = new FormControl();
  empinfo: EmpInfoModel[] = [];
  masterEmpInfo: EmpInfoModel[] = [];
  filteredOptions!: Observable<EmpInfoModel[]>;
  selectedEmployee: any[] = [];
  searchVal: string = '';

  constructor(
    public _util: MyUtility,
    public _appservice: AppsService
  ) { }

  ngOnInit(): void {
    this.LoadData();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith<string | EmpInfoModel>(''),
      map(value => typeof value === 'string' ? value : value?.frsT_NM || ''),
      map(name => name ? this._filter(name) : this.empinfo.slice())
    );
  }

  ngOnChanges(): void {
    // Handle changes if needed
  }

  private _filter(value: string): EmpInfoModel[] {
    const filterValue = value.toLowerCase();
    const emp = this.empinfo.filter(option => 
      option.frsT_NM.toLowerCase().includes(filterValue)
    );
    this.emitChanges();
    return emp;
  }

  displayFn(user?: EmpInfoModel): string {
    return user ? user.frsT_NM : '';
  }

  getsearchText(): string {
    if (this.searchText == undefined || this.searchText == null || this.searchText == '') {
      return 'Key Resource Name:';
    }
    return this.searchText + ':';
  }

  LoadData(): void {
    this.service_GetEmpInfo();
  }

  service_GetEmpInfo(): void {
    this._appservice.getEmpInfo().subscribe({
      next: (data: EmpInfoModel[]) => {
        this.empinfo = data;
        this.masterEmpInfo = data;
        
        const empRec = this.empinfo.find(x => x.emP_ID == this.emP_Name);
        if (empRec != null) {
          this.myControl.setValue(empRec);
        }
        
        if (this.multiSelect && data != null && data != undefined && data.length > 0) {
          this.selectedEmployee = this.emP_Name ? [this.emP_Name] : [];
        }
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  emitChanges(): void {
    const controlValue = this.myControl.value;
    if (controlValue && controlValue.emP_ID != undefined) {
      this.onChange.emit(controlValue.emP_ID);
    }
  }

  selectedEmployees(): void {
    this.onChange.emit(this.selectedEmployee);
  }

  onDropdownOpenedChanged(opened: boolean): void {
    if (opened) {
      this.searchVal = '';
      this.SearchKey(this.searchVal);
    }
  }

  onKeyUp(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value !== undefined) {
      this.onKey(target.value);
    }
  }

  onKey(value: string): void {
    this.empinfo = this.SearchKey(value);
  }

  SearchKey(value: string): EmpInfoModel[] {
    if (!value) {
      this.empinfo = this.masterEmpInfo;
      return this.empinfo;
    } else {
      if (this.masterEmpInfo != null && this.masterEmpInfo != undefined && this.masterEmpInfo.length > 0) {
        const empData = this.masterEmpInfo.filter(item => 
          this.selectedEmployee.some(x => x == item.emP_ID) ||
          item.frsT_NM.toLowerCase().includes(value.toLowerCase())
        );
        return empData;
      }
      return [];
    }
  }
}
