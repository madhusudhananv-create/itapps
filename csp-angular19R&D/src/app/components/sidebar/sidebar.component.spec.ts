import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { Configuration } from '../../core/services/app.configuration';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  const mockAppsService = {
    GetProjectsByEmpId: jasmine.createSpy('GetProjectsByEmpId').and.returnValue(of([])),
    getGetCSPDetails_Employee: jasmine.createSpy('getGetCSPDetails_Employee').and.returnValue(of([])), // ✅ used when logintype === 'gavs'
    getGetCSPDetails_Customer: jasmine.createSpy('getGetCSPDetails_Customer').and.returnValue(of([]))  // ✅ used when logintype !== 'gavs'
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs' },
    showInfo: jasmine.createSpy('showInfo') // ✅ used in OverallStatus_onClick
  };

  const mockMediaQueryList = {
    matches: false,
    addListener: jasmine.createSpy('addListener'),
    removeListener: jasmine.createSpy('removeListener'),
    addEventListener: jasmine.createSpy('addEventListener'),
    removeEventListener: jasmine.createSpy('removeEventListener'),
    dispatchEvent: jasmine.createSpy('dispatchEvent'),
    onchange: null,
    media: '(max-width: 600px)'
  } as any;

  const mockMediaMatcher = {
    matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
  };

  const mockConfiguration = {
    Server: { apiUrl: 'http://localhost' },
    ServerWithApiUrl: 'http://localhost/api/' // ✅ used in service_updateClientRag & service_updateRags
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        { provide: Configuration, useValue: mockConfiguration },
        ChangeDetectorRef
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    // ✅ Reset spies before each test to avoid cross-test contamination
    mockAppsService.getGetCSPDetails_Employee.calls.reset();
    mockAppsService.getGetCSPDetails_Customer.calls.reset();
    mockMediaQueryList.addListener.calls.reset();
    mockMediaQueryList.removeListener.calls.reset();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize receivedData as empty array', () => {
    expect(component.receivedData).toEqual([]);
  });

  it('should initialize EditCustIndex as -1', () => {
    expect(component.EditCustIndex).toBe(-1);
  });

  it('should initialize EditCustId as -1', () => {
    expect(component.EditCustId).toBe(-1);
  });

  it('should initialize EditProjIndex as -1', () => {
    expect(component.EditProjIndex).toBe(-1);
  });

  it('should initialize EditProjId as -1', () => {
    expect(component.EditProjId).toBe(-1);
  });

  it('should initialize mobileQuery', () => {
    expect(component.mobileQuery).toBeDefined();
  });

  it('should call getGetCSPDetails_Employee when logintype is gavs', () => {
    expect(mockAppsService.getGetCSPDetails_Employee).toHaveBeenCalledWith('E001');
  });

  it('should call removeListener on ngOnDestroy', () => {
    mockMediaQueryList.removeListener.calls.reset();
    component.ngOnDestroy();
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
  });
});