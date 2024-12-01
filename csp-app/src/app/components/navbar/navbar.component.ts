import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { myUtility } from '../../Shared/myUtility';

import { environment } from '../../../environments/environment';
import { AppsService } from '../../Services/apps.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private disabledMenu: boolean = false;

  private status: { isopen: boolean } = { isopen: false };
  constructor(public _util: myUtility, private _router: Router, private _appservice: AppsService) { }

  ngOnInit() {
  }
  private dropdownMenu($event: MouseEvent): void {
    (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    //$event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }
  home(){
    this._router.navigateByUrl("/dashboard");
  }
  logoutOffice365() {
    this._util.empid('');
    this._util.displayname('');
    this._util.token('');
    let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
    window.location.href = loginurl;
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        // let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        // window.location.href = loginurl;
        this._router.navigateByUrl('/login');
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
