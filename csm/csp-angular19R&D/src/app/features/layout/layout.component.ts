import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

// Components
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { MenuComponent } from '../../components/menu/menu.component';

// Services
import { MenuToggleService } from '../../core/services/menu-toggle.service';

/**
 * Layout Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Wrapper component for all customer-specific pages (overview, people, process, delivery, etc.)
 * Provides consistent structure and navigation context
 * 
 * Features:
 * - Shows navbar with menu disabled (ShowMenu=false)
 * - Provides outlet for child routes
 * - Maintains consistent layout for customer pages
 * - Shows menu when menu icon is clicked
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    NavbarNewComponent,
    MenuComponent
  ],
  template: `
    <div class="example-container" [class.example-is-mobile]="mobileQuery.matches">
      <app-navbar-new [ShowMenu]="false"></app-navbar-new>
      <mat-sidenav-container>
        <mat-sidenav-content style="background-color: #eaeaea">
          <div style="background-color:white" class="mainDiv">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .example-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    app-navbar-new {
      flex: 0 0 auto;
      margin: 0;
      padding: 0;
    }
    
    mat-sidenav-container {
      flex: 1;
      margin: 0;
      padding: 0;
      overflow: auto;
    }
    
    mat-sidenav-content {
      overflow-y: auto;
    }
    
    .mainDiv {
      min-height: calc(100vh - 40px);
    }
    
    .example-is-mobile .mainDiv {
      padding: 10px;
    }
    
    .mainDiv {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly menuToggleService = inject(MenuToggleService);
  private readonly media = inject(MediaMatcher);
  
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  menuToggleStatus: boolean = false;
  customerid: string = '';
  private menuToggleSub?: Subscription;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => {};
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    // Subscribe to menu toggle events from navbar
    this.menuToggleSub = this.menuToggleService.menuToggle$.subscribe(
      (value: boolean) => {
        this.menuToggleStatus = value;
      }
    );
    
    // Get customer ID from route params
    this.route.firstChild?.params.subscribe(params => {
      this.customerid = params['custid'] || '';
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.menuToggleSub) {
      this.menuToggleSub.unsubscribe();
    }
  }
}
