import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef ,ViewEncapsulation, Input } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { CustomerProjectIds } from '../../../models/customer-projects-model';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getMatIconFailedToSanitizeLiteralError } from '@angular/material';
import { ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';


@Component({
  selector: 'app-project-process-config',
  templateUrl: './project-process-config.component.html',
  styleUrls: ['./project-process-config.component.scss'],
})
export class ProjectProcessConfigComponent implements OnInit {
  ddData: any;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();


  serviceAreaList: ServiceAreaModelNew[] = [];

  custId: string;
  projId: string;
  mobileQuery: MediaQueryList;
  selectedProcessModel: number[] = [];
  duplicateselectedProcessModel: number[] = [];
  selectedServiceArea: number[] = [];
  ddprocessModelList: any;
  serviceArea:any = [];
  processDescription: any;
  gavsserviceArea:number[];
  enableDiv: Boolean = false;
  falseflag: boolean = false;
  isCheck: boolean = false;
  private _mobileQueryListener: () => void;
  constructor(private _appservice: AppsService, public _util: myUtility, private _router: Router, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private _formBuilder: FormBuilder, private _http: HttpClient) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ddServiceArea: any;
  ngOnInit() {
    this.getProcessModel();
    this.Service_GetServiceAreaList();
   // this.getDropDownParams()
  }
  ngOnChanges()
  {
    this.emitChanges()
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  getServiceCatalogue(processModel) {
    this._appservice.getServiceAreaforModel(processModel).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    )
  }
  getDropDownParams() {
    this.service_getDropDownDataForAudit()
  }
  ddProcessModel_Onchange() {
    //this.getServiceCatalogue(this.selectedProcessModel);
    this.getDropDownParams()
    //this.emitChanges();
  }
  ddServiceArea_Onchange() {
    this.getProcessDescription(this.custId, this.projId, this.selectedServiceArea);
  }

  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }
  getApplicableProcessArea()
  {
    let gavsArea :string[] = [];
    this.gavsserviceArea.map(function(t){
      gavsArea.push(t.toString())
    })
    this._appservice.getApplicableProcessAreaforServiceId(gavsArea).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    )
  }
  getProcessDescription(customerId, projectId, serviceArea) {
    this._appservice.getProcessModelDescription(customerId, projectId,serviceArea).subscribe(
      data => {
        this.processDescription = data;
        this.ClearAllSelection()
        if(this.processDescription.length != 0)
        {
          this.LoadDDData();
          this.getApplicableProcessArea()
        } 
        this.enableDiv = true
        this.isCheckAll();
      },
      error => { this._util.serviceError(error); }
    )
  }
  ClearAllSelection()
  {
    this.selectedProcessModel = [];
    this.selectedServiceArea = [];
    this.gavsserviceArea = []

  }
  LoadDDData() {
    this.selectedProcessModel = [];
    this.selectedServiceArea = [];
    this.gavsserviceArea = [];
    for (let i in this.processDescription) {
      this.selectedProcessModel.push(this.processDescription[i].modeL_ID);
      this.ddProcessModel_Onchange();
      for (let j in this.processDescription[i].servicE_AREA) {
        this.selectedServiceArea.push(this.processDescription[i].servicE_AREA[j].areA_ID)
      }
      for (let k in this.processDescription[i].gavS_SERVICE_AREA) {
        if(!this.gavsserviceArea.includes(this.processDescription[i].gavS_SERVICE_AREA[k]))
        this.gavsserviceArea.push(this.processDescription[i].gavS_SERVICE_AREA[k])
      }

    }
  }
  isCheckAll() {
    for (let i in this.processDescription) {
      for (let j in this.processDescription[i].servicE_AREA) {
        for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
          if (this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable == false) {
            this.isCheck = false;
            return;
          }
          else
            this.isCheck = true;
        }
      }
    }
  }
  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }

  getProcessModel() {
    this._appservice.getProcessModel().subscribe(
      data => {
        this.ddprocessModelList = data;
      },
      error => { this._util.serviceError(error); }
    )
  }

  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.enableDiv = false;
    this.selectedProcessModel = [];
    this.selectedServiceArea = [];
    this.gavsserviceArea = []
    this.ddServiceArea = [];
    this.serviceArea = [];
  }
  emitChanges() {
    let str: any;
    str = this.processDescription;
    this.onChange.emit(str);
  }
  SendIdtoArray(s) {
    if (s.applicable == true)
      s.applicable = false;
    else
      s.applicable = true;
    this.isCheckAll()
  }
 
  checkAll(eve) {
    if (eve.checked == true) {
      for (let i in this.processDescription) {
        for (let j in this.processDescription[i].servicE_AREA) {
          for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
            this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable = true;
          }
        }
      }
    }
    else {
      for (let i in this.processDescription) {
        for (let j in this.processDescription[i].servicE_AREA) {
          for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
            this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable = false;
          }
        }
      }
    }
  }
  SaveProcessConfig() {
    this.service_saveProcessConfig(this.processDescription);
    this.emitChanges()
  }
  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem("empid"));
    return headers;
  }
  Service_GetServiceAreaList(){
    this._appservice.getServiceAreaList().subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_saveProcessConfig(processDescription) {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token,'empId':localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddProjectProcessConfig';
    this._http.post(apiuri, processDescription, { headers: header })
      .subscribe(data => {
        alert("Saved Successfully");
      }, error => { this._util.serviceError(error); });
  }
  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.serviceArea = this.ddData.servicE_AREA;
      }, error => { this._util.serviceError(error); });
  }
}
