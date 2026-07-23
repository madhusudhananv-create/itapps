import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MyUtility } from '../../../shared/my-utility';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { ProcessModelMainComponent } from '../process-model-main/process-model-main.component';

@Component({
  selector: 'app-sqa-management-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    NavbarNewComponent,
    ProcessModelMainComponent
  ],
  templateUrl: './sqa-management-page.component.html',
  styleUrls: ['./sqa-management-page.component.scss']
})
export class SqaManagementPageComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  constructor(
    private _router: Router, 
    public _util: MyUtility, 
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
}
