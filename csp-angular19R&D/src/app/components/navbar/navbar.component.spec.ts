import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  const mockAppsService = {
    Logout: jasmine.createSpy('Logout').and.returnValue(of({}))
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs' },
    empid: jasmine.createSpy('empid'),
    displayname: jasmine.createSpy('displayname'),
    token: jasmine.createSpy('token')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize disabledMenu as true', () => {
    expect(component.disabledMenu).toBeTruthy();
  });

  it('should initialize status.isopen as false', () => {
    expect(component.status.isopen).toBeFalsy();
  });

  it('should toggle status.isopen on dropdownMenu call', () => {
    const mockEvent = { preventDefault: jasmine.createSpy(), stopPropagation: jasmine.createSpy() };
    component.dropdownMenu(mockEvent);
    expect(component.status.isopen).toBeTruthy();
    component.dropdownMenu(mockEvent);
    expect(component.status.isopen).toBeFalsy();
  });

  it('should call Logout service on service_Logout', () => {
    (component as any).service_Logout();
    expect(mockAppsService.Logout).toHaveBeenCalled();
  });
});
