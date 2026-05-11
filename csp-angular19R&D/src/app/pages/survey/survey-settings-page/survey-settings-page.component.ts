import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MyUtility } from '../../../shared/my-utility';
import { SurveyService } from '../../../core/services/survey.service';
import { environment } from '../../../../environments/environment';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { SurveySettingsComponent } from '../survey-settings/survey-settings.component';

@Component({
  selector: 'app-survey-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    NavbarNewComponent,
    SurveySettingsComponent
  ],
  templateUrl: './survey-settings-page.component.html',
  styleUrls: ['./survey-settings-page.component.scss']
})
export class SurveySettingsPageComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  constructor(
    public _util: MyUtility, 
    private surveyService: SurveyService, 
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
    this.surveyService.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }
}
