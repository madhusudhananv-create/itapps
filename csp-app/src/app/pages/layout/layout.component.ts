import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { cusT_GROUP } from '../../models/customer-portfolio-project-model';
import { LayoutService } from '../../pages/layout/layout.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(private _router: Router, public _layoutService:LayoutService, private _appservice: AppsService, public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ShowSideNav() {
    if (window.screen.width > 600) {
      this._util.ShowSideNav = true;
    }
    else {
      this._util.ShowSideNav = false;
    }
  }
  ngOnInit() {
    this.service_getCustomerPortfolioProjectList()
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  LoadDefaultProject(){
    if(this._layoutService.selectedProj == "0"){
      let custgroup = this._layoutService.custGroup.filter(t=> t.cusT_ID == this._layoutService.selectedCust);
      if(custgroup.length >0){
        if(custgroup[0].portfoliO_GROUP.length> 0){
          this._layoutService.selectedProj = custgroup[0].portfoliO_GROUP[0].projecT_INFO[0].proJ_ID;
        }
        else if(custgroup[0].projecT_INFO.length >0){
          this._layoutService.selectedProj = custgroup[0].projecT_INFO[0].proJ_ID;
        }
      }

    }
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
  service_getCustomerPortfolioProjectList() {
    this._appservice.getCustomerPortfolioProjectsList(localStorage.getItem('empid')).subscribe(data => {
      this._layoutService.custGroup = data;
      //this.LoadDefaultProject();
    },
      error => { this._util.serviceError(error); }
    )
  }
  
  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }
}

