import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { PeopleModel } from '../../../models/people-model';
import { AppsService } from '../../../Services/apps.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { AccessControl } from '../../../Shared/accessControl';

@Component({ 
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  ngtest:string;
  @Input() input: any;
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  dataSource: any;
  txtChallenges:any;
  displayedColumns = ['index', 'title','emP_Name', 'onsite', 'offshore'];
  //dataSource = new MatTableDataSource<any>(this.input.resource);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(private _access:AccessControl, private _http: Http, private _util: myUtility,private _appservice: AppsService) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.input.resource);
  }
  ngOnChange()
  {

  }
  readonlymode: boolean = true;
  editmode: boolean = false;
  editPeople: boolean = false;
  EditAllowed = true;
  // SaveRAG_onClick(rag,challenges) {
  //   if (rag === "" || rag === null||rag==undefined) {
  //     alert ("Please select RAG");
  //     return;
  //   }
  //   this.input.projecT_PEOPLE.rag = rag;
  //   this.input.projecT_PEOPLE.resourcE_CHALLENGES = challenges.value;
  //   this._util.updateRAG(this.input_rag, 'people', rag);
  //    this.service_updatePeople(this.input_projectid, rag, challenges.value);
  // }
  SubmitForm(forminput) {
    if (!forminput.valid) {
      alert('Please enter required fields');
      return;
    }
    let s: PeopleModel = new PeopleModel();
    s.projecT_ID = this.input_projectid;
    s.resourcE_CHALLENGES=forminput.value.txtChallenges;
    s.updateD_BY = localStorage.getItem('empid');
    s.updateD_DATE = new Date();
    this._util.updateRAG(this.input_rag, 'people', forminput.value.ragSelected);
    this.service_updatePeople(this.input_projectid, forminput.value.ragSelected, s.resourcE_CHALLENGES);
    //this.service_updateScope(this.input_projectid, rag, description, technology, scope);
    this.readonlymode = true;
    this.editmode = false;
    alert(" Saved successfully")
  }
  EditPeopleIndex: number;
  EditEmpID: string;
  EditPeople_onClick(index, id) {
    this.EditPeopleIndex = index;
    this.EditEmpID = id;
  }
  IsReadonlyCust(i, id) {
    return true;
    if (this.EditPeopleIndex === i && this.EditEmpID === id)
      return false;
    else
      return true;
  }
  SavePeople_onClick(emp) {
    this._appservice.updateResourceTitle(emp).subscribe(data => {
    this.getNewTitle();
     }, error => { this._util.serviceError(error); });
    this.EditPeopleIndex = null;
    this.EditEmpID = null;
  }
  CancelPeople_onClick() 
  {
    this.EditPeopleIndex = null;
    this.EditEmpID = null;
  }
  getNewTitle() 
  {
    if (this.input != null && this.input.resource.length > 0) {
        this._appservice.getNewResource(this.input_projectid)
          .subscribe(
          data => {
            this.input.resource = data;
          },
          error => {
            this._util.serviceError(error); 
          });
      }
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
  dataUpdate: any;
  fdate: any;
  service_updatePeople(projid, rag, challenges) {
    //var datePipe = new DatePipe("en-US");
    //this.fdate = datePipe.transform(Date(), 'dd/MM/yyyy').toString() ;
    let apiuri: string = environment.webapiuri + 'UpdatePeople';
 
    this.dataUpdate = {
      PROJECT_ID: projid,
      RAG: rag,
      RESOURCE_CHALLENGES: challenges,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }

    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************
}
