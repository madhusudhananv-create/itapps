import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  disabledMenu: boolean = true;
  public status: { isopen: boolean } = { isopen: false };
  
  constructor(
    public _util: MyUtility,
    private router: Router,
    private _service: AppsService
  ) { }

  ngOnInit() {
  }

  dropdownMenu($event: any): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  home() {
    this.router.navigate(['/dashboard']);
  }

  logoutOffice365() {
    localStorage.clear();
    window.location.href = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout';
  }

  logout() {
    const dialogRef = this._util.showWarningConfirmation(
      'Do you want to logout?',
      'Confirm Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
      if (this._util.AppSettings.logintype === 'gavs') {
        this.router.navigate(['/login']);
      }
      else {
        this.router.navigate(['/customer']);
      }
      this.service_Logout();
    }
    });
  }

  service_Logout() {
    this._service.Logout().subscribe((res: any) => {
      this._util.empid("");
      this._util.displayname("");
      this._util.token("");
    });
  }
}
