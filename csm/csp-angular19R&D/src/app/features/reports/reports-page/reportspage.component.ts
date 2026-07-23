import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MyUtility } from '../../../shared/my-utility';
import { ReportsService } from '../reports.service';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { ReportsComponent } from '../reports/reports.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reportspage',
  standalone: true,
  imports: [CommonModule, NavbarNewComponent, ReportsComponent],
  templateUrl: './reportspage.component.html',
  styleUrls: ['./reportspage.component.scss']
})
export class ReportspageComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  constructor(
    public _util: MyUtility, 
    private reportsService: ReportsService, 
    private _router: Router, 
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  logout() {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to log out?',
      'Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
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
    });
  }

  service_Logout() {
    this.reportsService.Logout().subscribe({
      next: (data: any) => {
        this._util.empid('');
        this._util.displayname('');
        this._util.token('');
      },
      error: (error: any) => { 
        this._util.serviceError(error); 
      }
    });
  }
}
