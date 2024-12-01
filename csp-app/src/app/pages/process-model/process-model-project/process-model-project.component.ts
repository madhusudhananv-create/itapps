import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { EmpInfoModel } from '../../../models/emp-info-model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-process-model-project',
  templateUrl: './process-model-project.component.html',
  styleUrls: ['./process-model-project.component.scss']
})
export class ProcessModelProjectComponent implements OnInit {
  mobileQuery: MediaQueryList;
  startDate: Date ;
  months: string[] = [];
  endDate: Date ;
  auditorList:EmpInfoModel[] = [];
  supportFunctions:any;
  auditType:any = [];
  scopeAudit :any = []
  frequency:any;
  statusAudit:any;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  private _mobileQueryListener: () => void;
  constructor(public _util: myUtility, private _appservice: AppsService, private _router: Router, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,private _formBuilder: FormBuilder) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit() {
    this.getMonths();
    this.getAuditorList();
    this.getFrequencyAudit();
    this.getAuditType();
    this.getScopeAudit();
    this.getAuditSupportFunctions();
    this.getStatusAudit();
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  // applyFilter(filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }
  getMonths() {
    this.months = [];
    this.startDate = new Date(new Date().getFullYear(),0,1);
    this.endDate = new Date(new Date().getFullYear(),11,31);
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let st = this.startDate.getMonth();
    let en = this.endDate.getMonth();
    if (this.startDate.getFullYear() == this.endDate.getFullYear()) {
      while (st <= en) {
        this.months.push(monthNames[st])
        st = st + 1;
      }
    }
  }
  getAuditorList()
  {
    this._appservice.getAuditorList().subscribe(data => {
      this.auditorList = data;
    }, error => { this._util.serviceError(error); })
  }
  getAuditType()
  {
    this._appservice.getAuditType().subscribe(data => {
      this.auditType = data;
    }, error => { this._util.serviceError(error); })
  }
  getFrequencyAudit()
  {
    this._appservice.getFrequencyAudit().subscribe(data => {
      this.frequency = data;
    }, error => { this._util.serviceError(error); })
  }
  getAuditSupportFunctions()
  {
    this._appservice.getAuditSupportFunctions().subscribe(data => {
      this.supportFunctions = data;
    }, error => { this._util.serviceError(error); })
  }
  getScopeAudit()
  {
    this._appservice.getScopeofAudit().subscribe(data => {
      this.scopeAudit = data;
    }, error => { this._util.serviceError(error); })
  }
  getStatusAudit()
  {
    this._appservice.getStatusofAudit().subscribe(data => {
      this.statusAudit = data;
    }, error => { this._util.serviceError(error); })
  }
  stDate_onChange($event) {
    let obj: Date = $event;
    this.startDate = obj;
  }
  enDate_onChange($event) {
    let obj: Date = $event;
    this.endDate = obj;
    this.getMonths()
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

  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }


}
