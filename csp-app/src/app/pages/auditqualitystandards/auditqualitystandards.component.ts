import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { EmpInfoModel } from '../../models/emp-info-model';
import { ProcessModelNew } from '../../models/audit-checklist-based-model';

@Component({
  selector: 'app-auditqualitystandards',
  templateUrl: './auditqualitystandards.component.html',
  styleUrls: ['./auditqualitystandards.component.scss']
})
export class AuditqualitystandardsComponent implements OnInit {

  result: any = [];
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['index', 'frsT_NM', 'procesS_MODEL', 'effectivE_FROM', 'action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  editItem: any = [];
  editmode: boolean = false;
  readonlymode: boolean = true;
  empList: EmpInfoModel[];
  ProcessModelList: ProcessModelNew[];

  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl) { }


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
    }, error => { this._util.serviceError(error); });
  }

  GetQASpocDetails() {
    this._appservice.GetQASpocDetails().subscribe(data => {
      this.empList = data;
    }, error => { this._util.serviceError(error); });
  }

  RefreshTable(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }
    this.editItem.procesS_MODEL_ID = '';
    this.editItem.title.forEach((i: any) => {
      this.editItem.procesS_MODEL_ID += this.ProcessModelList.filter(x => x.title == i)[0].id + ",";
    });
    this.editItem.effectivE_FROM = this._util.setLocaleDate(this.editItem.effectivE_FROM);
    this.UpdateAuditor(this.editItem);
    this.neweditItem();
    this.getAuditorQualityStandardDetails();
  }

  UpdateAuditor(item) {
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
    this.editItem = new AuditQualifiedStandardModel();
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.GetQASpocDetails();
    this.getProcessModelList();
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element) {
    this.editItem = Object.assign({}, element);
    if (this.editItem.procesS_MODEL) {
      let title = this.editItem.procesS_MODEL.split(",").map((item) => { return item.trim() });
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

export class AuditQualifiedStandardModel {
  id: number;
  emP_ID: string;
  qualifieD_STANDARDS: number;
  procesS_MODEL_ID: string;
  effectivE_FROM: Date;
  createD_BY: String;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

