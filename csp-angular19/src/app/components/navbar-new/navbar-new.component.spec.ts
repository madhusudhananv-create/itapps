import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { NavbarNewComponent } from './navbar-new.component';
import { AppsService } from '../../core/services/apps.service';
import { AuthService } from '../../core/services/auth.service';

describe('NavbarNewComponent', () => {
  let component: NavbarNewComponent;
  let fixture: ComponentFixture<NavbarNewComponent>;

  const mockAppsService = {
    Logout: jasmine.createSpy('Logout').and.returnValue(of({}))
  };

  const mockAuthService = {
    userSession$: of(null),                                                      // ✅ matches: this.authService.userSession$.pipe(...)
    currentUser: jasmine.createSpy('currentUser').and.returnValue(null),         // ✅ matches: this.authService.currentUser()
    getUserSession: jasmine.createSpy('getUserSession').and.returnValue(of(null)),
    logout: jasmine.createSpy('logout').and.returnValue(of({}))
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NavbarNewComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isLoggingOut signal as false', () => {
    expect(component.isLoggingOut()).toBeFalsy();
  });

  it('should initialize toggleMenu signal as false', () => {
    expect(component.toggleMenu()).toBeFalsy();
  });

  it('should initialize isMenuOpen signal as false', () => {
    expect(component.isMenuOpen()).toBeFalsy();
  });

  it('should initialize logoutError signal as null', () => {
    expect(component.logoutError()).toBeNull();
  });

  it('should have showDashboardMenu output defined', () => {
    expect(component.showDashboardMenu).toBeDefined();
  });
});
