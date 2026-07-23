import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ReportspageComponent } from './reportspage.component';
import { MyUtility } from '../../../shared/my-utility';
import { ReportsService } from '../reports.service';

describe('ReportspageComponent', () => {
  let component: ReportspageComponent;
  let fixture: ComponentFixture<ReportspageComponent>;
  let mockUtil: any;
  let mockReportsService: any;
  let mockRouter: any;
  let mockMediaMatcher: any;
  let mockMediaQueryList: any;

  beforeEach(waitForAsync(() => {
    mockMediaQueryList = {
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      matches: false
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      empid: jasmine.createSpy('empid'),
      displayname: jasmine.createSpy('displayname'),
      token: jasmine.createSpy('token'),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockReportsService = {
      Logout: jasmine.createSpy('Logout').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [ReportspageComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: ReportsService, useValue: mockReportsService },
        { provide: Router, useValue: mockRouter },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        ChangeDetectorRef,
        provideHttpClient(),
        provideRouter([])
      ]
    }).overrideComponent(ReportspageComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize mobileQuery via MediaMatcher on construction', () => {
    expect(mockMediaMatcher.matchMedia).toHaveBeenCalledWith('(max-width: 600px)');
    expect(component.mobileQuery).toBeDefined();
  });

  it('should add a listener to mobileQuery on construction', () => {
    expect(mockMediaQueryList.addListener).toHaveBeenCalled();
  });

  describe('ngOnDestroy', () => {
    it('should remove the mobileQuery listener on destroy', () => {
      component.ngOnDestroy();
      expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call showWarningConfirmation dialog', () => {
      component.logout();
      expect(mockUtil.showWarningConfirmation).toHaveBeenCalled();
    });

    it('should call service_Logout and navigateByUrl when confirmed and not GAVS', () => {
      mockUtil.IsGAVS.and.returnValue(false);
      mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
      component.logout();
      expect(mockReportsService.Logout).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('should call service_Logout and navigateByUrl when confirmed and IsGAVS is true', () => {
      mockUtil.IsGAVS.and.returnValue(true);
      mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
      component.logout();
      expect(mockReportsService.Logout).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('should not call service_Logout when confirmation is cancelled', () => {
      mockReportsService.Logout.calls.reset();
      mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(false) });
      component.logout();
      expect(mockReportsService.Logout).not.toHaveBeenCalled();
    });

    it('should not navigate when confirmation is cancelled', () => {
      mockRouter.navigateByUrl.calls.reset();
      mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(false) });
      component.logout();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('service_Logout', () => {
    it('should clear empid, displayname, and token on success', () => {
      mockReportsService.Logout.and.returnValue(of({}));
      component.service_Logout();
      expect(mockUtil.empid).toHaveBeenCalledWith('');
      expect(mockUtil.displayname).toHaveBeenCalledWith('');
      expect(mockUtil.token).toHaveBeenCalledWith('');
    });

    it('should call serviceError on failure', () => {
      mockReportsService.Logout.and.returnValue(throwError(() => new Error('error')));
      component.service_Logout();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
