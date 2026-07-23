import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppsService, EmpInfoModel, ProcessModelNew, AuditQualifiedStandardModel } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

/**
 * Auditor Quality Standards Component
 * Manages auditor qualifications and process model assignments
 * 
 * Features:
 * - View all auditor qualified standards
 * - Edit auditor qualifications
 * - Assign process models to auditors
 * - Set effective date for qualifications
 * - Table view with sorting and pagination
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved
 */
@Component({
  selector: 'app-auditqualitystandards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    NavbarNewComponent
  ],
  templateUrl: './auditqualitystandards.component.html',
  styleUrls: ['./auditqualitystandards.component.scss']
})
export class AuditqualitystandardsComponent implements OnInit {

  result: any = [];
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table!: ElementRef;
  displayedColumns = ['index', 'frsT_NM', 'procesS_MODEL', 'effectivE_FROM', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  editItem: AuditQualifiedStandardModel = {};
  editmode: boolean = false;
  readonlymode: boolean = true;
  empList: EmpInfoModel[] = [];
  ProcessModelList: ProcessModelNew[] = [];

  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(
    private route: ActivatedRoute, 
    private _appservice: AppsService, 
    private _shared: SharedService, 
    public _util: MyUtility, 
    private changeDetectorRefs: ChangeDetectorRef, 
    public _access: AccessControl
  ) { }

  ngOnInit() {
    this.getAuditorQualityStandardDetails();
  }

  getAuditorQualityStandardDetails() {
    this._appservice.GetAuditQualityStandardControls().subscribe(
      data => {
        this.result = data;
        this.RefreshTable(this.result);
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  getProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.ProcessModelList = data;
    }, error => { 
      this._util.serviceError(error); 
    });
  }

  GetQASpocDetails() {
    this._appservice.GetQASpocDetails().subscribe(data => {
      this.empList = data;
    }, error => { 
      this._util.serviceError(error); 
    });
  }

  RefreshTable(data: any) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  SubmitForm(isValid: any) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }
    this.editItem.procesS_MODEL_ID = '';
    if (this.editItem.title) {
      this.editItem.title.forEach((i: any) => {
        const matchingModel = this.ProcessModelList.filter(x => x.title == i)[0];
        if (matchingModel) {
          this.editItem.procesS_MODEL_ID += matchingModel.id + ",";
        }
      });
    }
    if (this.editItem.effectivE_FROM) {
      this.editItem.effectivE_FROM = this._util.setLocaleDate(this.editItem.effectivE_FROM);
    }
    this.UpdateAuditor(this.editItem);
    this.neweditItem();
    this.getAuditorQualityStandardDetails();
  }

  UpdateAuditor(item: AuditQualifiedStandardModel) {
    this._appservice.UpdateAuditor(item).subscribe(data => {
      alert("Data Save Successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.getAuditorQualityStandardDetails();
    },
    (error) => {
      this._util.serviceError(error);
    })
  }

  neweditItem() {
    this.editItem = {};
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.GetQASpocDetails();
    this.getProcessModelList();
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element: any) {
    this.editItem = Object.assign({}, element);
    if (this.editItem.procesS_MODEL) {
      let title = this.editItem.procesS_MODEL.split(",").map((item: string) => { return item.trim() });
      this.editItem.title = title;
    }
    this.Edit_onClick();
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.neweditItem();
    this.getAuditorQualityStandardDetails();
  }
}
