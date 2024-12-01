import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { ValueaddModel } from '../../../models/valueadd-model';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-valueadds',
  templateUrl: './valueadds.component.html',
  styleUrls: ['./valueadds.component.scss']
})
export class ValueaddsComponent implements OnInit {
  @Input() input: any[];
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  EditValueadd: ValueaddModel;
  displayedColumns = ['index', 'description', 'benefits', 'valueadD_BY', 'actioN_PLAN', 'targeT_DATE', 'status', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>(this.input);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService) { }
  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.input);
    this.newEditValueadd();
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.input);
    this.newEditValueadd();
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
    if (this.EditValueadd.id === 0 || this.EditValueadd.id === undefined) {
      this.EditValueadd.id = 0;
      this.EditValueadd.projecT_ID = this.input_projectid;
      this.EditValueadd.rag = 'green';
      this.EditValueadd.createD_BY = localStorage.getItem('empid');
      this.EditValueadd.createD_DATE = new Date();
      this.EditValueadd.updateD_BY = localStorage.getItem('empid');
      this.EditValueadd.updateD_DATE = new Date();
      this.service_addValueadd(this.EditValueadd);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditValueadd.updateD_BY = localStorage.getItem('empid');
      this.EditValueadd.updateD_DATE = new Date();
      this.service_updateValueadd(this.EditValueadd);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditValueadd();
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
  }
  EditRow_onClick(element) {
    this.EditValueadd = element;
    this.Edit_onClick()
  }
  SaveRAG_onClick(rag) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this._util.updateRAG(this.input_rag, 'valueadds', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'valueadds',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteValueadd(element).subscribe(
        data => {
          this.input.splice(this.input.indexOf(element), 1);
          this.RefreshTable();
        },
        error => {
          this._util.serviceError(error);
        });

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
    return headers;
  }
  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { alert(error.text());
        //console.log(error.text());
       });
  }
  service_addValueadd(valueadd) {
    let apiuri: string = environment.webapiuri + 'AddValueadds';
    this._http.post(apiuri, valueadd, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.push(JSON.parse(data.text()));
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  service_updateValueadd(valueadd) {
    let apiuri: string = environment.webapiuri + 'UpdateValueadds';
    this._http.post(apiuri, valueadd, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  newEditValueadd() {
    this.EditValueadd = new ValueaddModel();
  }
}