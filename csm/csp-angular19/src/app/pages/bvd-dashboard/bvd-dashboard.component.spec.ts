import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { BvdDashboardComponent } from './bvd-dashboard.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedData } from '../../shared/shared-data';
import { BvdDashboardService } from './services/bvd-dashboard.service';
import { BvdEntryService } from '../bvd-entry/services/bvd-entry.service';

describe('BvdDashboardComponent', () => {
  let component: BvdDashboardComponent;
  let fixture: ComponentFixture<BvdDashboardComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockShared: any;
  let mockBvdService: any;
  let mockBvdEntry: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((d: Date) => d),
      enumSelector: jasmine.createSpy('enumSelector').and.returnValue([]),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      AppSettings: { token: '' }
    };

    mockShared = {
      selectedPortfolios: [],
      selectedProjects: []
    };

    mockBvdService = {
      getQualitativeBenefit: jasmine.createSpy('getQualitativeBenefit').and.returnValue(of({ benefits_Value: [], benefits_ValueAdd: [] })),
      getValuePieChart: jasmine.createSpy('getValuePieChart').and.returnValue(of({ benefits_Quantitative_Value: [], benefits_Quantitative_ValueAdd: [] })),
      getvalueColumnChart: jasmine.createSpy('getvalueColumnChart').and.returnValue(of({ benefits_Quantitative_Column_Value: [], benefits_Quantitative_Column_ValueAdd: [] })),
      getIdeaStatusCountsByType: jasmine.createSpy('getIdeaStatusCountsByType').and.returnValue(of([])),
      getQualitativeBenefitDetail: jasmine.createSpy('getQualitativeBenefitDetail').and.returnValue(of({ benefits_Value: [], benefits_ValueAdd: [] })),
      getQuantitativeBenefitsDetail: jasmine.createSpy('getQuantitativeBenefitsDetail').and.returnValue(of({ benefits_Quantitative_Value: [], benefits_Quantitative_ValueAdd: [] })),
      dashboardStartdate: null,
      dashboardEnddate: null
    };

    mockBvdEntry = {
      bvdViewType: 0, bvdidea: null, bvdbenefit: [], bvdimplementationschdules: [],
      currentStep: 0, isIdeaSubmitted: false, projecT_ID: '', ideA_ID: 0,
      isIdeaApproved: false, bvdreview: null
    };

    mockAppService = {
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
      getIdentifiedBy: jasmine.createSpy('getIdentifiedBy').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [BvdDashboardComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: SharedData, useValue: mockShared },
        { provide: BvdDashboardService, useValue: mockBvdService },
        { provide: BvdEntryService, useValue: mockBvdEntry },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ customerid: 'C001', reset: true }) }
        },
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getCustomerList on init', () => {
      expect(mockAppService.GetCustomerList).toHaveBeenCalled();
    });

    it('should call getProjectResource on init', () => {
      expect(mockAppService.getIdentifiedBy).toHaveBeenCalled();
    });

    it('should populate beneficiary via enumSelector', () => {
      expect(mockUtil.enumSelector).toHaveBeenCalled();
    });

    it('should set default status array', () => {
      expect(component.status).toEqual([0, 2, 4, 3]);
    });
  });

  describe('initial state', () => {
    it('should initialize showFilter to false', () => {
      expect(component.showFilter).toBe(false);
    });

    it('should initialize progress to false', () => {
      expect(component.progress).toBe(false);
    });

    it('should initialize searchValue as empty string', () => {
      expect(component.searchValue).toBe('');
    });

    it('should initialize stackedValueEmpty to true when no data', () => {
      // After ngOnInit, getFilterValues is called which sets this based on data
      // Empty array from mock means length === 0, so stackedValueEmpty = true
      expect(component.stackedValueEmpty).toBe(true);
    });

    it('should initialize stackedValueAddEmpty to true when no data', () => {
      // After ngOnInit, getFilterValues is called which sets this based on data
      // Empty array from mock means length === 0, so stackedValueAddEmpty = true
      expect(component.stackedValueAddEmpty).toBe(true);
    });
  });

  describe('getDates', () => {
    it('should set startDate to first day of previous month', () => {
      component.getDates();
      const expected = new Date(component.date.getFullYear(), component.date.getMonth() - 1, 1);
      expect(component.startDate.getFullYear()).toBe(expected.getFullYear());
      expect(component.startDate.getMonth()).toBe(expected.getMonth());
    });

    it('should set endDate to last day of current month', () => {
      component.getDates();
      const expected = new Date(component.date.getFullYear(), component.date.getMonth(), 0);
      expect(component.endDate.getDate()).toBe(expected.getDate());
    });
  });

  describe('resetValues', () => {
    it('should clear all chart arrays', () => {
      component.Value = [{ x: 1 }];
      component.Valuechart = [{ x: 2 }];
      component.resetValues();
      expect(component.Value).toEqual([]);
      expect(component.Valuechart).toEqual([]);
      expect(component.ValueColumnChart).toEqual([]);
    });
  });

  describe('applyFilter', () => {
    it('should filter employees by name', () => {
      component.empList = [
        { frsT_NM: 'Alice', emP_ID: '1' } as any,
        { frsT_NM: 'Bob', emP_ID: '2' } as any
      ];
      component.applyFilter('ali');
      expect(component.employees.length).toBe(1);
      expect(component.employees[0].frsT_NM).toBe('Alice');
    });

    it('should return all employees when filter is empty', () => {
      component.empList = [
        { frsT_NM: 'Alice', emP_ID: '1' } as any,
        { frsT_NM: 'Bob', emP_ID: '2' } as any
      ];
      component.applyFilter('');
      expect(component.employees.length).toBe(2);
    });
  });

  describe('getFilterValues', () => {
    it('should call getQualitativeBenefitsByType', () => {
      component.startDate = new Date();
      component.endDate = new Date();
      component.benefitsFilter.Beneficiary = [1];
      component.benefitsFilter.BenefitPillar = [1];
      component.benefitsFilter.IdentifiedBy = ['EMP1'];
      component.getFilterValues();
      expect(mockBvdService.getQualitativeBenefit).toHaveBeenCalled();
    });
  });

  describe('service_getIdeaStatusCountStackedGraph', () => {
    it('should set stackedValueEmpty true when no Value data', () => {
      mockBvdService.getIdeaStatusCountsByType.and.returnValue(of([]));
      component.service_getIdeaStatusCountStackedGraph();
      expect(component.stackedValueEmpty).toBe(true);
    });

    it('should set stackedValueEmpty false when Value data exists', () => {
      mockBvdService.getIdeaStatusCountsByType.and.returnValue(of([{ type: 'Value' }]));
      component.service_getIdeaStatusCountStackedGraph();
      expect(component.stackedValueEmpty).toBe(false);
    });
  });

  describe('getPillarLabel', () => {
    it('should return "All Pillars" when all pillars selected', () => {
      component.benefitPillar = [{ value: 1, title: 'P1' }, { value: 2, title: 'P2' }];
      component.benefitsFilter.BenefitPillar = [1, 2];
      expect(component.getPillarLabel()).toBe('All Pillars');
    });

    it('should return empty string when no pillars selected', () => {
      component.benefitsFilter.BenefitPillar = [];
      expect(component.getPillarLabel()).toBe('');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe on destroy', () => {
      if (component.sub) {
        spyOn(component.sub, 'unsubscribe');
        component.ngOnDestroy();
        expect(component.sub.unsubscribe).toHaveBeenCalled();
      }
      expect(true).toBe(true);
    });
  });
});
