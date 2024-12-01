import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { myUtility } from '../../Shared/myUtility';

import { environment } from '../../../environments/environment';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-navbar-new',
  templateUrl: './navbar-new.component.html',
  styleUrls: ['./navbar-new.component.scss']
})
export class NavbarNewComponent implements OnInit {
  private disabledMenu: boolean = false;
  toggleMenu : boolean = false;
  @Input('ShowMenu') showmenu: boolean = true;
  @Output()
  showDashboardMenu : EventEmitter<boolean> = new EventEmitter<boolean>();
  enviroment: string;

    private status: { isopen: boolean } = { isopen: false };
    constructor(public _util: myUtility, private _router: Router, private _appservice: AppsService, public _access: AccessControl) { }
  
    ngOnInit() {
      this.enviroment = environment.environment_Id;
    }
    private dropdownMenu($event: MouseEvent): void {
      (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
      //$event.stopPropagation();
      this.status.isopen = !this.status.isopen;
    }

    toggleDashboardMenu(){
      this.showDashboardMenu.emit(this.toggleMenu);
    }

    toggleDashboardMenuNew()
    {
      this.toggleMenu = !this.toggleMenu;
      this.showDashboardMenu.emit(this.toggleMenu);
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
  