import { Component, OnInit, Input, Output } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { ScopeModel } from '../../../models/scope-Model';
import { AppsService } from '../../../Services/apps.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AccessControl } from '../../../Shared/accessControl';


@Component({
  selector: 'app-scope',
  templateUrl: './scope.component.html',
  styleUrls: ['./scope.component.scss']
})
export class ScopeComponent implements OnInit {
  @Input() input: any;
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  panels:any;
  constructor(private _access:AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, private _router: Router) { }

  ngOnInit() {
    this.input.rag = this._util.getRAG(this.input_rag, 'scope');
  }
  ngOnChanges() {
    this.input.rag = this._util.getRAG(this.input_rag, 'scope');
  }
  
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  // Save_onClick(rag, description, technology, scope)
  // {
  //   this.input.rag = rag;
  //   this.input.description = description;
  //   this.input.technologY_USED = technology;
  //   this.input.scope = scope;
  //   this._util.updateRAG(this.input_rag, 'scope', rag);

  //   this.service_updateScope(this.input_projectid, rag, description, technology, scope);
  //   this.readonlymode = true;
  //   this.editmode = false;
  // }
  // Save_onClick(rag, description, technology, scope) {
  SubmitForm(forminput) {
    if (!forminput.valid) {
      alert('Please enter required fields');
      return;
    }
    let s: ScopeModel = new ScopeModel();
    s.projecT_ID = this.input_projectid;
    s.rag = forminput.value.ragSelected;
    s.description = forminput.value.txtdescription;
    s.technologY_USED = forminput.value.txttechnology;
    s.scope = forminput.value.txtscope;
    s.updateD_BY = localStorage.getItem('empid');
    s.updateD_DATE = new Date();
    this._util.updateRAG(this.input_rag, 'scope', forminput.value.ragSelected);
    // this._appservice.updateScope(s).subscribe(data => { }, error => { this._util.serviceError(error); });
    //this.service_updateScope(this.input_projectid, rag, description, technology, scope);
    this.readonlymode = true;
    this.editmode = false;
  }
  tempData: any = { 'description': '', 'scope': '', 'technologY_USED': '' }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.LoadTempDate(this.input, this.tempData);
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.LoadTempDate(this.tempData, this.input);
  }
  //**********************************************
  // General Methods
  //**********************************************
  LoadTempDate(i, o) {
    o.description = i.description;
    o.scope = i.scope;
    o.technologY_USED = i.technologY_USED;
  }

  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  dataUpdate: any;
  service_updateScope(projid, rag, description, technology, scope) {
    let apiuri: string = environment.webapiuri + 'UpdateScope';
    this.dataUpdate = {
      PROJECT_ID: projid,
      RAG: rag,
      DESCRIPTION: description,
      TECHNOLOGY_USED: technology,
      SCOPE: scope,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }
    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************

}
