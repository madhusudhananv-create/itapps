import { provideAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { SuccessgoalComponent } from './successgoal.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { ChartsService } from '../../services/charts.service';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('SuccessgoalComponent', () => {
  let component: SuccessgoalComponent;
  let fixture: ComponentFixture<SuccessgoalComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockChartsService: any;
  let mockDialog: any;
  let mockMediaQueryList: any;
  let mockMediaMatcher: any;

  beforeEach(waitForAsync(() => {
    mockMediaQueryList = {
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      matches: false
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      AppSettings: { token: 'test-token', empid: '', displayname: '', role: '' },
      tableYear: 2024,
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false)
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockChartsService = {
      getTrendHighChartDetails: jasmine.createSpy('getTrendHighChartDetails').and.returnValue(of({})),
      getTrendHighChartDetailsForProductKPI: jasmine.createSpy('getTrendHighChartDetailsForProductKPI').and.returnValue(of({})),
      getTableSuccess: jasmine.createSpy('getTableSuccess').and.returnValue(of({}))
    };

    mockAppService = {
      getDBConfigValueFields: jasmine.createSpy('getDBConfigValueFields').and.returnValue(of('')),
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getServiceAreaProjectMapping: jasmine.createSpy('getServiceAreaProjectMapping').and.returnValue(of([])),
      getProjectName: jasmine.createSpy('getProjectName').and.returnValue(of('')),
      getServiceTowersProjectMapping: jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [SuccessgoalComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: ChartsService, useValue: mockChartsService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ projid: 'P001', custid: 'C001', year: '2024', month: '3' }) }
        },
        provideHttpClient(),
        provideAnimations(),
        ChangeDetectorRef
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('slaAvailableList', JSON.stringify([{ customerId: 'C001', slaAvailable: false }]));
    localStorage.setItem('viewBy', '');
    localStorage.setItem('includeExclusions', '');
    fixture = TestBed.createComponent(SuccessgoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('slaAvailableList');
    localStorage.removeItem('viewBy');
    localStorage.removeItem('includeExclusions');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize showMetrics to false', () => {
      expect(component.showMetrics).toBe(false);
    });

    it('should initialize isProdView to false', () => {
      expect(component.isProdView).toBe(false);
    });

    it('should initialize selGroupBy to "1"', () => {
      expect(component.selGroupBy).toBe('1');
    });

    it('should initialize KPIIndex to -1', () => {
      expect(component.KPIIndex).toBe(-1);
    });

    it('should initialize OpenFilter to false', () => {
      expect(component.OpenFilter).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to route params and set input_projId', () => {
      expect(component.input_projId).toBe('P001');
    });

    it('should set input_custId from route params', () => {
      expect(component.input_custId).toBe('C001');
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove mobileQuery listener on destroy', () => {
      component.ngOnDestroy();
      expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
    });
  });
});
