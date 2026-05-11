import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { AccessControlProjectComponent } from './access-control-project/access-control-project.component';
import { AccessControlProjectResourceComponent } from './access-control-project-resource/access-control-project-resource.component';
import { environment } from '../../../environments/environment';

/**
 * Access Control Project Page Component
 * Main container for managing project access controls
 * 
 * Features:
 * - Two tabs:
 *   1. Resource wise Projects - Assign projects to resources
 *   2. Project wise resource - Assign resources to projects
 * - Mobile responsive layout
 * - Navbar integration
 */
@Component({
  selector: 'app-access-control-project-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTabsModule,
    NavbarNewComponent,
    AccessControlProjectComponent,
    AccessControlProjectResourceComponent
  ],
  templateUrl: './access-control-project-page.component.html',
  styleUrls: ['./access-control-project-page.component.scss']
})
export class AccessControlProjectPageComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public _util: MyUtility,
    private _appservice: AppsService,
    private _router: Router,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // Component initialization
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
          let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
          window.location.href = loginurl;
        }
        else {
          this.service_Logout();
          this._router.navigateByUrl('/login');
        }
      }
    });
  }

  service_Logout() {
    this._appservice.Logout().subscribe({
      next: (data) => {
        this._util.empid('');
        this._util.displayname('');
        this._util.token('');
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }
}
