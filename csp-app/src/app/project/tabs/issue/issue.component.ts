import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { IssueModel } from '../../../models/issue-model';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss']
})
export class IssueComponent implements OnInit {
  @Input() input: any;
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  EditIssue: IssueModel;
  displayedColumns = ['index', 'description', 'issuE_TYPE', 'severitY', 'actioN_PLAN', 'assigneD_TO','identifieD_DATE','targeT_DATE','issuE_RESOLVED_DATE', 'status', 'edit', 'delete'];
  dataSource = new MatTableDataSource(this.input);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access:AccessControl) { }
  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.input);
    this.newEditIssue();
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
    this.newEditIssue();   
    this.newEditIssue();
  }
  levelmode: boolean = false;
  impactmode:boolean=false;
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.EditIssue.id === 0 || this.EditIssue.id === undefined) {
      this.EditIssue.id = 0;
      this.EditIssue.projecT_ID = this.input_projectid;
      this.EditIssue.rag = 'green';
      this.EditIssue.createD_BY = localStorage.getItem('empid');
      this.EditIssue.createD_DATE = new Date();
      this.EditIssue.updateD_BY = localStorage.getItem('empid');
      this.EditIssue.updateD_DATE = new Date();
      this.service_addIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditIssue.updateD_BY = localStorage.getItem('empid');
      this.EditIssue.updateD_DATE = new Date();
      let issue = this.input.filter(t => t.id == this.EditIssue.id)[0];
      issue = this.EditIssue;
      this.service_updateIssue(this.EditIssue);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditIssue();
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditIssue();
  }
  EditRow_onClick(element) {
    this.EditIssue = this._util.CopyObject(element);
    // this.EditIssue.id = element.id;
    // this.EditIssue.projecT_ID = element.projecT_ID;
    // this.EditIssue.rag = element.rag;
    // this.EditIssue.description = element.description;
    // this.EditIssue.issuE_TYPE = element.issuE_TYPE;
    // this.EditIssue.severity = element.severity;
    // this.EditIssue.actioN_PLAN = element.actioN_PLAN;
    // this.EditIssue.assigneD_TO = element.assigneD_TO;
    // this.EditIssue.identifieD_BY = element.identifieD_BY;
    // this.EditIssue.reporteD_BY = element.reporteD_BY;
    // this.EditIssue.level = element.level;
    // this.EditIssue.identifieD_DATE = element.identifieD_DATE;
    // this.EditIssue.targeT_DATE = element.targeT_DATE;
    // this.EditIssue.status = element.status;
    // this.EditIssue.createD_BY = element.createD_BY;
    // this.EditIssue.createD_DATE = element.createD_DATE;
    // this.EditIssue.updateD_BY = element.updateD_BY;
    // this.EditIssue.updateD_DATE = element.updateD_DATE;
    // this.EditIssue.isactive = element.isactive;
    // this.EditIssue.comments = element.comments;
    if (this.EditIssue.reporteD_BY != "reportedbyGAVS")
      this.EnableLevel();
    // this.EditIssue.id = element.id;
    // this.EditIssue.projecT_ID = element.projecT_ID;
    // this.EditIssue.rag = element.rag;
    // this.EditIssue.description = element.description;
    // this.EditIssue.impacT_SUMMARY =element.impacT_SUMMARY;
    // this.EditIssue.iS_POTENTIAL_RISK =element.iS_POTENTIAL_RISK;
    // this.EditIssue.businesS_IMPACT =element.businesS_IMPACT;
    // this.EditIssue.geO_LOCATION =element.geO_LOCATION;
    // this.EditIssue.issuE_TYPE = element.issuE_TYPE;
    // this.EditIssue.severity = element.severity;
    // this.EditIssue.actioN_PLAN = element.actioN_PLAN;
    // this.EditIssue.assigneD_TO = element.assigneD_TO;
    // this.EditIssue.identifieD_BY = element.identifieD_BY;
    // this.EditIssue.reporteD_BY = element.reporteD_BY;
    // this.EditIssue.level=element.level;
    // this.EditIssue.identifieD_DATE = element.identifieD_DATE;
    // this.EditIssue.targeT_DATE = element.targeT_DATE;
    // this.EditIssue.status = element.status;
    // this.EditIssue.issuE_RESOLVED_DATE =element.issuE_RESOLVED_DATE;
    // this.EditIssue.createD_BY = element.createD_BY;
    // this.EditIssue.createD_DATE = element.createD_DATE;
    // this.EditIssue.updateD_BY = element.updateD_BY;
    // this.EditIssue.updateD_DATE = element.updateD_DATE;   
    // this.EditIssue.isactive = element.isactive;
    // this.EditIssue.comments = element.comments;
    this.EditIssue = element;
    if(this.EditIssue.iS_POTENTIAL_RISK == true)
    this.EnableImpact();
    if(this.EditIssue.reporteD_BY != "reportedbyGAVS")
    this.EnableLevel();
    //this.EditIssue = element;
    this.Edit_onClick()
  }
  EnableLevel() {
    this.levelmode = true;
  }
  DisableLevel() {
    this.levelmode = false;
  }
  EnableImpact()
  {
    this.impactmode=true;
  }
  DisableImpact()
  {
    this.impactmode=false;
  }
  SaveRAG_onClick(rag) {
    this._util.updateRAG(this.input_rag, 'issue', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'issue',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteIssue(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.RefreshTable();
    } else {

    }
  }
  RefreshTable() {
 
    this.dataSource = new MatTableDataSource<any>(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empid', localStorage.getItem('empid'));
    return headers;
  }
  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  service_addIssue(issue: IssueModel) {
    let apiuri: string = environment.webapiuri + 'AddIssue';
    this._http.post(apiuri, issue, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.push(JSON.parse(data.text()));
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  service_updateIssue(issue: IssueModel) {
    let apiuri: string = environment.webapiuri + 'UpdateIssue';
    this._http.post(apiuri, issue, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  newEditIssue() {
    this.EditIssue = new IssueModel();
    this.EditIssue.reporteD_BY = "reportedbyGAVS";
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
