import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { AccessControlProjectPageComponent } from './access-control-project-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';

describe('AccessControlProjectPageComponent', () => {
  let component: AccessControlProjectPageComponent;
  let fixture: ComponentFixture<AccessControlProjectPageComponent>;

  const mockMediaQueryList = {
    matches: false,
    addListener: jasmine.createSpy('addListener'),
    removeListener: jasmine.createSpy('removeListener')
  };

  const mockMediaMatcher = {
    matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
  };

  const mockAppsService = {
    Logout: jasmine.createSpy('Logout').and.returnValue(of({})),
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    GetProjectResourceByEmpId: jasmine.createSpy('GetProjectResourceByEmpId').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError'),
    empid: jasmine.createSpy('empid'),
    displayname: jasmine.createSpy('displayname'),
    token: jasmine.createSpy('token')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AccessControlProjectPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl }
      ]
    });
    TestBed.overrideComponent(AccessControlProjectPageComponent, {
      set: { imports: [], template: '<div></div>' }
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set up mobileQuery via MediaMatcher', () => {
    fixture.detectChanges();
    expect(mockMediaMatcher.matchMedia).toHaveBeenCalledWith('(max-width: 600px)');
    expect(component.mobileQuery).toBeTruthy();
  });

  it('should remove media query listener on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
  });

  it('should call Logout service on service_Logout', () => {
    component.service_Logout();
    expect(mockAppsService.Logout).toHaveBeenCalled();
  });
});
