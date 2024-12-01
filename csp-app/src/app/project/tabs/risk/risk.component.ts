//import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http,  RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { RiskModel } from '../../../models/risk-model';
import { FormsModule } from '@angular/forms';
import { RiskDatasource } from '../../../Services/risk-datasource';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge } from "rxjs/observable/merge";
import { AccessControl } from '../../../Shared/accessControl';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { RiskClickDetailComponent } from './risk-click-detail/risk-click-detail.component';
import { FiltersModel } from '../../../models/filters-model';
import { FilterPreferenceModel } from '../../../models/filter-preference-model';
import { ParameterModel } from '../../../models/parameter-model';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss'],
})
export class RiskComponent implements OnInit {
  @Input() input: RiskModel[];
  @Input('inputrag') input_rag: any;
  @Input('CustomerId') input_customerid: string;
  @Input('ProjectId') input_projectid: string;
  fields: string[] = [];
  EditRisk: RiskModel;
  TeamMembers: EmpInfoModel[] = [];
  displayedColumns = ['rag', 'index', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'status', 'actioN_TAKEN', 'edit', 'delete', 'view'];
  //filters: FiltersModel = new FiltersModel(this._util, this._appservice, this.input, 'PROJECT_RISK');
  dataSource = new MatTableDataSource(this.input);
  @ViewChild('paginatorRisk') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.input);
    this.GetEmployeeNames();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.service_getAuditeeDetails(this.input_customerid, this.input_projectid);
  }

  numberOfTicks = 0;
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access: AccessControl, public dialog: MatDialog) {
  }
  ngOnInit() {
    //this.filters = new FiltersModel(this._util, this._appservice, this.input, 'PROJECT_RISK');
    this.dataSource = new MatTableDataSource(this.input);
    this.GetEmployeeNames();
    this.newEditRisk();
    this.service_getAuditeeDetails(this.input_customerid, this.input_projectid);
  }
  ngOnChanges() {
    //this.filters = new FiltersModel(this._util, this._appservice, this.input, 'PROJECT_RISK');
    this.dataSource = new MatTableDataSource(this.input);
    this.GetEmployeeNames();
    this.newEditRisk();
    this.service_getAuditeeDetails(this.input_customerid, this.input_projectid);
  }

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.EditRisk.id === 0 || this.EditRisk.id === undefined) {
      this.EditRisk.id = 0;
      this.EditRisk.projecT_ID = this.input_projectid;
      this.EditRisk.rag = 'green';
      this.EditRisk.createD_BY = localStorage.getItem('empid');
      this.EditRisk.createD_DATE = new Date();
      this.EditRisk.updateD_BY = localStorage.getItem('empid');
      this.EditRisk.updateD_DATE = new Date();
      this.service_addRisk(this.EditRisk);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditRisk.updateD_BY = localStorage.getItem('empid');
      this.EditRisk.updateD_DATE = new Date();
      this.service_updateRisk(this.EditRisk);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditRisk();
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditRisk()
  }

  EditRow_onClick(element) {
    this.EditRisk = element;
    this.Edit_onClick();
  }

  SaveRAG_onClick(rag) {
    this._util.updateRAG(this.input_rag, 'risk', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'risk',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteRisk(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.RefreshTable();
    } else {

    }
  }
  ViewRow_onClick(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      element: element,
    }
    const dialogRef = this.dialog.open(RiskClickDetailComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource(this.input);
    this.GetEmployeeNames();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getRiskRag(element) {
    let val = "black";
    if (element != undefined && element.probabilitY_SCALE != undefined && element.impacT_SCALE != undefined) {
      let sKey: string = element.probabilitY_SCALE.toString() + element.impacT_SCALE.toString();
      for (let rg of this.ragvalues) {
        if (rg.key === sKey)
          val = rg.value;
      }
    }
    return val;
  }

  private ragvalues = [
    { key: '11', value: 'green' },
    { key: '12', value: 'green' },
    { key: '13', value: 'green' },
    { key: '14', value: 'orange' },
    { key: '15', value: 'orange' },

    { key: '21', value: 'green' },
    { key: '22', value: 'green' },
    { key: '23', value: 'orange' },
    { key: '24', value: 'orange' },
    { key: '25', value: 'orange' },

    { key: '31', value: 'green' },
    { key: '32', value: 'orange' },
    { key: '33', value: 'orange' },
    { key: '34', value: 'orange' },
    { key: '35', value: 'red' },

    { key: '41', value: 'orange' },
    { key: '42', value: 'orange' },
    { key: '43', value: 'orange' },
    { key: '44', value: 'red' },
    { key: '45', value: 'red' },

    { key: '51', value: 'orange' },
    { key: '52', value: 'orange' },
    { key: '53', value: 'red' },
    { key: '54', value: 'red' },
    { key: '55', value: 'red' },
  ];

  //**********************************************
  //service methods
  //**********************************************
  service_getAuditeeDetails(customerId, projectId) {
    if (projectId != undefined && projectId != null && projectId.trim() != ""
      && customerId != 0) {
      this._appservice.getAuditeeDetails(customerId, projectId, false).subscribe(data => {
        this.TeamMembers = data;
        this.TeamMembers.forEach(x=> x.empid = x.emP_ID.toString());
      }, error => { this._util.serviceError(error); });
    }
  }

  GetEmployeeNames()
  {
    this.input.forEach(x=>
      {
       let empid = x.owner;
       this._appservice.getEmpNameById(empid).subscribe(
        data => {
            x.ownernametext = data;
        },
        error => { return empid;}
      )
      });
   
  }

  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    // this._http.post(apiuri, ragdetails, { headers: this._appservice.GetAuthHeader() })
    //   .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  service_addRisk(risk: RiskModel) {
    let apiuri: string = environment.webapiuri + 'AddRisk';
    let header =  this._appservice.GetAuthHeader() ;
    // console.log(header);
    // this._http.post(apiuri, risk, { headers: header})
    //   .subscribe(data => {
    //     this.input.push(JSON.parse(data.text()));
    //     this.RefreshTable();
    //     this._http.get(environment.webapiuri +'LoadOverAllRisksData', { headers: this._appservice.GetAuthHeader() })
    //     .subscribe(data => {}, error => {});
    //   }, error => { this._util.serviceError(error); });
  }
  service_updateRisk(risk: RiskModel) {
    let apiuri: string = environment.webapiuri + 'UpdateRisk';
  //   this._http.post(apiuri, risk, { headers: this._appservice.GetAuthHeader() })
  //     .subscribe(data => {
  //       this.RefreshTable();
  //       this._http.get(environment.webapiuri +'LoadOverAllRisksData', { headers: this._appservice.GetAuthHeader() })
  //       .subscribe(data => {}, error => {});
  //     }, error => { this._util.serviceError(error); });
    }
  //**********************************************
  newEditRisk() {
    this.EditRisk = new RiskModel();
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}