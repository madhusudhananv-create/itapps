import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { filter } from 'rxjs';

// Material imports
import { MatSidenavModule } from '@angular/material/sidenav';

// Components
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

// Services
import { MenuToggleService } from '../../core/services/menu-toggle.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    NavbarNewComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  showMenu: boolean = false; // Default is false (hide menu icon)

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router,
    private menuToggleService: MenuToggleService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    // Listen to route changes to determine if menu icon should be shown
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateMenuVisibility(event.url);
    });
    
    // Set initial state based on current route
    this.updateMenuVisibility(this.router.url);
  }

  private updateMenuVisibility(url: string): void {
    // Show menu icon on:
    // 1. Dashboard-navigation routes: /newdashboard/cust (NOT /custm)
    // 2. All layout child routes: /layout/* (overview, people, process, delivery, etc.)
    // 3. COO dashboard
    this.showMenu = url.includes('/newdashboard/cust/') || 
                    url === '/newdashboard/cust' ||
                    url.includes('/layout/') ||
                    url.includes('/coodashboard');
  }

  /**
   * Handle menu toggle event from navbar
   * Forward it to MenuToggleService so dashboard components can subscribe
   */
  onMenuToggle(value: boolean): void {
    this.menuToggleService.toggleMenu(value);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
