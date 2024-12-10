
import { Component, OnInit, Inject, InjectionToken } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  busy: Promise<any>;
  email: string = "";
  password: string = "";
  gslab: string = "";
  companyName = environment.company_name;

  constructor(private _router: Router, private _http: Http, private _util: myUtility, private _appservice: AppsService,
    private _access: AccessControl, private _spinner: Ng4LoadingSpinnerService, private _activatedRoute: ActivatedRoute
    //, public socialAuthService: SocialAuthService
  ) {


  }

  private gavsService: SocialAuthService;
  //private gslabService : SocialAuthService;
  ngOnInit() {

    const gapi = loadGapiInsideDOM();

    this._activatedRoute.params.subscribe(params => {
      this.gslab = params['gslab'];
      if (this.gslab == 'gslab') {
        this.gavsService = new SocialAuthService({
          autoLogin: false,
          providers: [{
            id: GoogleLoginProvider.PROVIDER_ID,
            provider:
              new GoogleLoginProvider(
                environment.googleClientId
              )
          }]
        });
        alert("Please click on GSLab google icon to login.");
      }
      else {
        this.gavsService = new SocialAuthService({
          autoLogin: false,
          providers: [{
            id: GoogleLoginProvider.PROVIDER_ID,
            provider:
              new GoogleLoginProvider(
                environment.gavsGoogleClientId
              )
          }]
        });


      }

    })


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

  // doOneLogin() {
  //   (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
  //   if (this.email === undefined)
  //     alert("Please enter GsLab Id or email Id");
  //   else if (this.email.trim() === "")
  //     alert("Please enter  GsLab Id or email Id")
  //   else if (environment.production === true && this.email.toLowerCase().search('@gavstech.com') >= 0)
  //     alert("GAVS users, please click here to sign-in through Office 365")
  //   // else if (this.email.toLowerCase().search('@') === -1)
  //   //   alert("Please enter a valid email id")
  //   else if (environment.production === true && this.password === undefined)
  //     alert("Please enter the password")
  //   else if (environment.production === true && this.password.trim() === "")
  //     alert("Please enter the password")
  //   else
  //     this.AuthenticateUserOneLogin(this.email, this.password)

  // }

  SubmitForm(isValid) {
    (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    if (this.email === undefined)
      alert("Please enter the email id");
    else if (this.email.trim() === "")
      alert("Please enter the email id")
    else if (environment.production === true && this.email.toLowerCase().search('@gavstech.com') >= 0)
      alert(`${this.companyName} users, please click here to sign-in through Google`);
    else if (this.email.toLowerCase().search('@') === -1)
      alert("Please enter a valid email id")
    else if (environment.production === true && this.password === undefined)
      alert("Please enter the password")
    else if (environment.production === true && this.password.trim() === "")
      alert("Please enter the password")
    else
      this.AuthenticateUser(this.email, this.password)
    //this.Authenticate(this.email, this.password)
  }
  //**********************************************
  //service methods
  //**********************************************
  dataUpdate: any;
  // createAuthorizationHeader(headers: Headers, username, password) {
  //   headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
  // }
  //**********************************************
  // Authenticate(username, password) {
  //   this._spinner.show();
  //   let apiuri = environment.webapiuri_auth + "Authenticate";
  //   let headers = new Headers();
  //   this.createAuthorizationHeader(headers, username, password);
  //   this._http.get(apiuri, { headers: headers })
  //     .subscribe
  //     (
  //       response => {
  //         this._spinner.hide();
  //         this.SetEnvironmentVariables(username, response);
  //       },
  //       error => {
  //         this._spinner.hide();
  //         this._util.serviceError(error);
  //       }
  //     );
  // }

  AuthenticateUser(username, password) {
    localStorage.clear();
    this._spinner.show();
    let apiuri = environment.webapiuri_auth + "AuthenticateUser";
    let headers = new Headers();
    let credentials: string = btoa(username + ':' + password);
    this._http.post(apiuri, credentials, { headers: headers })
      .subscribe
      (

        response => {

          this._spinner.hide();
          this.SetEnvironmentVariables(username, response);
        },
        error => {
          this._spinner.hide();
          this._util.serviceError(error);
        }
      );
  }

  // AuthenticateUserOneLogin(username, password) {
  //   this._spinner.show();
  //   let apiuri = environment.webapiuri_auth + "AuthenticateOneLoginUser";
  //   let headers = new Headers();
  //   let credentials: string = btoa(username + ':' + password);
  //   this._http.post(apiuri, credentials, { headers: headers })
  //     .subscribe
  //     (

  //       response => {

  //         this._spinner.hide();
  //         this.SetEnvironmentVariables(username, response);
  //       },
  //       error => {
  //         this._spinner.hide();
  //         this._util.serviceError(error);
  //       }
  //     );
  // }

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

    // localStorage.setItem('projIds', "");
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
      this._appservice.GetCustomerList(localStorage.getItem('empid'), true).subscribe(data => {

        localStorage.setItem('CustomerIds', JSON.stringify(data));
        localStorage.setItem('slaAvailableList', JSON.stringify(data.map(x => ({ customerId: x.cusT_ID, customerName: x.cusT_NM, slaAvailable: x.iS_SLA_AVAILABLE }))));

      });
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


  // officeurl: string = environment.officesite + environment.tenantid + '/oauth2/authorize?' +
  //   'client_id=' + environment.clientid + '&response_type=id_token' + '&redirect_uri=' + environment.redirect
  //   + '&response_mode=query&scope=openid&state=12345&nonce=' + Guid.newGuid();

  // For deploying Azure UAT
  officeurl: string = environment.officesite + environment.tenantid + '/oauth2/authorize?' +
    'client_id=' + environment.clientid + '&response_type=id_token' + '&redirect_uri=' + environment.redirect +
    '&response_mode=fragment&scope=openid&state=12345&nonce=' + Guid.newGuid();

  O365_onclick() {
    const one = new Promise<string>((resolve, reject) => {

      localStorage.setItem('loginRequested', '1');
      console.log(localStorage.getItem('loginRequested'));
      resolve('hello');
    });

    one.then(x => {
      window.location.href = this.officeurl;
    });
    //this._router.navigate(this.officeurl);
  }

  private initializeObject(clientId: string) {

    // this.gavsService = new SocialAuthService( {
    //   autoLogin: false,
    //   providers: [{
    //     id: GoogleLoginProvider.PROVIDER_ID,
    //     provider :
    //     new GoogleLoginProvider(      
    //   clientId//  environment.gavsGoogleClientId
    //   )}]
    // })
    // this.delay(2000);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then(() => console.log("fired"));
  }

  public GavsSocialSignIn() {
    let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    this.initializeObject(environment.gavsGoogleClientId);
    if (this.gslab != 'gslab') {
      //this.gavsService.signOut();
      this.gavsService.signIn(socialPlatformProvider).then(
        (userData) => {
          this.AuthenticateGoogleLogin(userData);
        }
      )
        .catch((a) => { console.log(a); });
    }
    else  
    {
      
      const url = this._router.serializeUrl(this._router.createUrlTree(['/login'],
      //{ queryParams: { gslab: 'gslab' } }
    ));
    window.open(url, '_blank');

    }
  }


  public GsLabSocialSignIn() {
    //alert('Unable to signin at the moment!')
    if (this.gslab != 'gslab') {
      //this._router.navigateByUrl('/login?gslab=gslab');
      const url = this._router.serializeUrl(this._router.createUrlTree(['/login/gslab'],
        //{ queryParams: { gslab: 'gslab' } }
      ));
      window.open(url, '_blank');
    }
    else {
      let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;

      //this.initializeObject(environment.googleClientId);
      //this.gavsService.signOut();
      this.gavsService.signIn(socialPlatformProvider).then(
        (userData) => {
          this.AuthenticateGoogleLogin(userData);
        }
      )
        .catch((a) => { console.log(a); });
    }


  }

}

