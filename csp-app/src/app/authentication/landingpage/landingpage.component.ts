import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { AppsService } from '../../Services/apps.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { myUtility } from '../../Shared/myUtility';
import { AccessControl } from '../../Shared/accessControl';
import { AppServiceOthers } from '../../Services/apps.service.other';
import { promise } from 'protractor';
import { ok } from 'assert';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {
  private sub: any;
  oauth: string;
  empid: string;
  webapiuri: String = "";
  canedit: any;
  displayname: string;
  token: string;

  //receivedData: ClientDetailsModel[];
  SelectedData: any;
  constructor(private route: ActivatedRoute, private _util: myUtility, private _router: Router, private _http: Http, private _appservice: AppsService, private _access: AccessControl, private _spinner: Ng4LoadingSpinnerService, private _otherServices: AppServiceOthers) { }

  ngOnInit() {

    let val = localStorage.getItem('loginRequested');
    localStorage.setItem('loginRequested', '0');
    if (val == undefined || val == null || val != '1') {
      this._router.navigateByUrl('/login');
    }
    else {

      // this.sub = this.route.queryParams.subscribe(
      //   t => {
      //     this.oauth = t.id_token;
      //   });

      this.sub = this.route.fragment.subscribe(
        t => {
          let sFragment: string = t;
          const params = new URLSearchParams(sFragment)
          this.oauth = params.get('id_token');

        });


      //customer login

      if (this.oauth === undefined || this.oauth === "") {
        this.empid = localStorage.getItem('empid');
        if (this.empid === '') { //invalid routing redirecting to loginpage
          this._router.navigateByUrl('/login');
        }
        else {
          this.webapiuri = environment.webapiuri;
          this.canedit = localStorage.getItem('canedit');

          this.displayname = localStorage.getItem('displayname');
          this.token = localStorage.getItem('token');
          this._util.validateLogin();
          //this.loadProjects(this.empid);
          let navigateUrl = localStorage.getItem('navigateurl');
          if (navigateUrl != undefined && navigateUrl != null && navigateUrl.trim() != "") {
            this._router.navigateByUrl(navigateUrl);
            //localStorage.setItem('navigateurl','')
          }
          this._router.navigateByUrl('/dashboard');

        }
      }//gavs login
      else {
        this.Authenticate(this.oauth);
        //this.loadProjects(this.oauth);
      }
    }
  }

  Authenticate(oauth) {
    this._spinner.show();
    localStorage.setItem('projIds', "");
    localStorage.setItem('CustomerIds', "");
    let apiuri = environment.webapiuri_auth + 'AuthenticateToken?Token=' + oauth;
    this._http.get(apiuri)
      .subscribe
      (
        response => {
          this._spinner.hide();
          this._util.token(response.headers.get('token'));
          this._util.empid(response.headers.get('empid'));
          this._util.role(response.headers.get('role'));
          this._util.logintype(response.headers.get('logintype'));
          this._util.displayname(response.headers.get('displayname'));
          this._util.access(response.headers.get('access'));

          this.webapiuri = environment.webapiuri;
          this.canedit = localStorage.getItem('canedit');
          this.empid = localStorage.getItem('empid');
          this.displayname = localStorage.getItem('displayname');
          this.token = localStorage.getItem('token');
          this._util.LoadAppRoles();
          this._access.accessControlRepository = this._util.getAccessList();

          
          let navigateUrl = localStorage.getItem('navigateurl');
         
          if (navigateUrl != undefined && navigateUrl != null && navigateUrl.trim() != '' && navigateUrl.indexOf("login") < 0) {

            localStorage.setItem('navigateurl', '');

            this._router.navigateByUrl(navigateUrl);

          }
          else
            this._router.navigateByUrl('/newdashboard/custm');

          this.loadInitialData();

        },
        error => {
          this._spinner.hide();
          this._util.serviceError(error);
        }
      );
  }

  loadInitialData() {
    let isToFindSLA = true;
    this._appservice.GetCustomerList(this.empid, isToFindSLA);
    this._util.getProjectListForUser();



  }
}
