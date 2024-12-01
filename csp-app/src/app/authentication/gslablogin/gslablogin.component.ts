
import { Component, OnInit, Inject, InjectionToken } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, NgModel, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { AppsService } from '../../Services/apps.service';
import { Guid } from '../../Shared/guid';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AccessControl } from '../../Shared/accessControl';
import { resolve } from 'url';
import { SocialAuthService, GoogleLoginProvider } from 'angularx-social-login';
import { loadGapiInsideDOM } from 'gapi-script';

@Component({
  selector: 'app-gslablogin',
  templateUrl: './gslablogin.component.html',
  styleUrls: ['./gslablogin.component.scss']
})
export class GslabloginComponent implements OnInit {

  busy: Promise<any>;
  email: string = "";
  password: string = "";

  constructor(private _router: Router, private _http: Http, private _util: myUtility, private _appservice: AppsService,
    private _access: AccessControl, private _spinner: Ng4LoadingSpinnerService
    //, public socialAuthService: SocialAuthService
  ) {


  }

  
  //private gslabService : SocialAuthService;
  ngOnInit() {
 //  const gapi = loadGapiInsideDOM();
     
//  let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
//  this._util.gavsService.signIn(socialPlatformProvider).then(
//   (userData) => {
//     this.AuthenticateGoogleLogin(userData);
//   }
// )
//   .catch((a) => { console.log(a); });

 
    //this.GsLabSocialSignIn();

  }

  getUserNameType(loginType) {
    if (loginType === 'CustomerLogin')
      return "Email Id";
    else if (loginType === 'GAVSLogin')
      return "Username";
  }

  _isVisible: string = 'Login';
  isVisible(selected) {
    if (selected === this._isVisible)
      return true;
  }
  toggle(selected) {
    this._isVisible = selected;
  }
   dataUpdate: any;




  AuthenticateGoogleLogin(data) {

    this._spinner.show();
    let apiuri = environment.webapiuri_auth + "AuthenticateGoogleToken";
    let headers = new Headers();

    this._http.post(apiuri, data, { headers: headers })
      .subscribe
      (

        response => {

          this._spinner.hide();
          this.SetEnvironmentVariables('', response);
        },
        error => {
          this._spinner.hide();
          this._util.serviceError(error);
        }
      );
  }

  SetEnvironmentVariables(username, response) {
    
    localStorage.setItem('projIds', "");
    localStorage.setItem('CustomerIds', "");
    let isToFindSLA = true;
    this._util.logintype(response.headers.get('logintype'));
    if (this._util.AppSettings.logintype === 'gavs' || this._util.AppSettings.logintype === 'gslab') {
      this._util.token(response.headers.get('token'));
      this._util.empid(response.headers.get('empid'));
      this._util.displayname(response.headers.get('displayname'));
      this._util.role(response.headers.get('role'));
      this._util.access(response.headers.get('access'));
      this._access.accessControlRepository = this._util.getAccessList();// data;
      let navigateUrl = localStorage.getItem('navigateurl');
      localStorage.setItem('navigateurl', '');
      if (navigateUrl != undefined && navigateUrl != null && navigateUrl.trim() != "" && navigateUrl.indexOf("login") < 0)
        this._router.navigateByUrl(navigateUrl);
      else
        this._router.navigateByUrl('/newdashboard/custm');
    }
    else if (this._util.AppSettings.logintype === 'customer') {
      this._util.token(response.headers.get('token'));
      this._util.empid(username);
      this._util.displayname(response.headers.get('displayname'));
      this._util.role(response.headers.get('role'));
      this._util.access(response.headers.get('access'));
      this._access.accessControlRepository = this._util.getAccessList();
      let navigateUrl = localStorage.getItem('navigateurl');
      localStorage.setItem('navigateurl', '');
      this._appservice.GetCustomerList(username, isToFindSLA).subscribe(data => {
        if (data.length > 0) {
          localStorage.setItem('CustomerIds', JSON.stringify(data));
          localStorage.setItem('slaAvailableList', JSON.stringify(data.map(x => ({ customerId: x.cusT_ID, customerName: x.cusT_NM, slaAvailable: x.iS_SLA_AVAILABLE }))));
        }
      });
      if (navigateUrl != undefined && navigateUrl != null && navigateUrl.trim() != "" && navigateUrl.indexOf("login") < 0)
        this._router.navigateByUrl(navigateUrl);
      else
        this._router.navigateByUrl('/newdashboard/cust');
    }
  }


 

  public GsLabSocialSignIn() {
  //   let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    

  
  //   this._util.gavsService.signIn(socialPlatformProvider).then(
  //     (userData) => {
  //       this.AuthenticateGoogleLogin(userData);
  //     }
  //   )
  //     .catch((a) => { console.log(a); });
    }


}
