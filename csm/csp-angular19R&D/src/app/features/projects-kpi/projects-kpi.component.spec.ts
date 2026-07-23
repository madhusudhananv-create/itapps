import { fakeAsync, tick, waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ProjectsKPIComponent } from './projects-kpi.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AuthService } from '../../core/services/auth.service';

const mockKpiData = {
  projectsKpi: [{ kpiName: 'On Time Delivery', periods: [{ kpiachievementscore: 90 }] }],
  monthColumns: ['Jan-2024', 'Feb-2024']
};

const mockGlobalCategories = [
  { id: 1, title: 'Group A', category: [{ id: 10, shorT_DESC: 'KPI Alpha' }, { id: 11, shorT_DESC: 'KPI Beta' }] },
  { id: 2, title: 'Group B', category: [{ id: 12, shorT_DESC: 'KPI Gamma' }] }
];

const mockServiceAreaList = [
  { id: 1, title: 'Tower A' },
  { id: 2, title: 'Tower B' }
];

describe('ProjectsKPIComponent', () => {
  let component: ProjectsKPIComponent;
  let fixture: ComponentFixture<ProjectsKPIComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      GetGlobalKPICategoryDetailsAcrossProject: jasmine.createSpy('GetGlobalKPICategoryDetailsAcrossProject')
        .and.returnValue(of(mockKpiData)),
      GetConsolidatedProjectWiseKPIDetails: jasmine.createSpy('GetConsolidatedProjectWiseKPIDetails')
        .and.returnValue(of(mockKpiData)),
      GetGlobalKpiCategories: jasmine.createSpy('GetGlobalKpiCategories')
        .and.returnValue(of(mockGlobalCategories)),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList')
        .and.returnValue(of(mockServiceAreaList)),
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([])),
      GetRASCustomerList: jasmine.createSpy('GetRASCustomerList').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      getMonthAbr: jasmine.createSpy('getMonthAbr').and.returnValue('Jan'),
      getMonthNum: jasmine.createSpy('getMonthNum').and.returnValue(0),
      exportToExcel: jasmine.createSpy('exportToExcel')
    };

    TestBed.configureTestingModule({
      imports: [ProjectsKPIComponent],
      providers: [
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AuthService, useValue: { isGAVSUser: () => false } },
        provideHttpClient()
      ]
    })
    .overrideComponent(ProjectsKPIComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsKPIComponent);
    component = fixture.componentInstance;
    spyOn(component, 'toggleSelectionForService');
    localStorage.setItem('role', '5');
  });

  afterEach(() => localStorage.removeItem('role'));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── Default state ─────────────────────────────────────────────────────────

  describe('default state', () => {
    it('should have selectedoption="PROJECT" by default', () => {
      fixture.detectChanges();
      expect(component.selectedoption).toBe('PROJECT');
    });

    it('should have menuToggleStatus=false by default', () => {
      fixture.detectChanges();
      expect(component.menuToggleStatus).toBe(false);
    });

    it('should have empty globaL_KPI_CATEGORY_IDs', () => {
      fixture.detectChanges();
      expect(component.globaL_KPI_CATEGORY_IDs).toEqual([]);
    });
  });

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set role from localStorage', () => {
      localStorage.setItem('role', '1');
      fixture.detectChanges();
      expect(component.role).toBe('1');
      localStorage.setItem('role', '5');
    });

    it('should set allcustFlag=true for role "1"', () => {
      localStorage.setItem('role', '1');
      fixture.detectChanges();
      expect(component.allcustFlag).toBe(true);
      expect(component.allprojFlag).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should set allcustFlag=false for non-admin role', () => {
      localStorage.setItem('role', '5');
      fixture.detectChanges();
      expect(component.allcustFlag).toBe(false);
      expect(component.allprojFlag).toBe(false);
    });

    it('should call Service_GetProjectKPIData on init', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetGlobalKPICategoryDetailsAcrossProject).toHaveBeenCalled();
    });

    it('should call service_GetGlobalKpiCategories on init', () => {
      fixture.detectChanges();
      expect(mockAppsService.GetGlobalKpiCategories).toHaveBeenCalled();
    });

    it('should call GetServiceAreaList for admin role', () => {
      localStorage.setItem('role', '1');
      fixture.detectChanges();
      expect(mockAppsService.getServiceAreaList).toHaveBeenCalled();
      localStorage.setItem('role', '5');
    });
  });

  // ─── Service_GetProjectKPIData ─────────────────────────────────────────────

  describe('Service_GetProjectKPIData', () => {
    it('should set projectsKpi and monthColumns from service', () => {
      fixture.detectChanges();
      component.Service_GetProjectKPIData(component.requestObj);
      expect(component.projectsKpi).toEqual(mockKpiData.projectsKpi);
      expect(component.monthColumns).toEqual(mockKpiData.monthColumns);
    });

    it('should set processedData from service', () => {
      fixture.detectChanges();
      component.Service_GetProjectKPIData(component.requestObj);
      expect(component.processedData).toEqual(mockKpiData);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetGlobalKPICategoryDetailsAcrossProject.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.Service_GetProjectKPIData(component.requestObj);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── service_GetGlobalKpiCategories ───────────────────────────────────────

  describe('service_GetGlobalKpiCategories', () => {
    it('should set GlobalCategories and filteredGlobalCategories', () => {
      fixture.detectChanges();
      component.service_GetGlobalKpiCategories();
      expect(component.GlobalCategories).toEqual(mockGlobalCategories as any);
      expect(component.filteredGlobalCategories).toEqual(mockGlobalCategories as any);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetGlobalKpiCategories.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.service_GetGlobalKpiCategories();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── GetServiceAreaList ────────────────────────────────────────────────────

  describe('GetServiceAreaList', () => {
    it('should populate ServiceAreaList and filteredServiceAreaList', fakeAsync(() => {
      fixture.detectChanges();
      component.selectservice = { options: { forEach: () => {}, filter: () => [] } } as any;
      component.GetServiceAreaList();
      tick(mockServiceAreaList.length + 1);
      expect(component.ServiceAreaList).toEqual(mockServiceAreaList);
      expect(component.filteredServiceAreaList).toEqual(mockServiceAreaList);
    }));
  });

  // ─── onMenuToggleChange ────────────────────────────────────────────────────

  describe('onMenuToggleChange', () => {
    it('should update menuToggleStatus', () => {
      fixture.detectChanges();
      component.onMenuToggleChange(true);
      expect(component.menuToggleStatus).toBe(true);
    });
  });

  // ─── getCustAndProjects ───────────────────────────────────────────────────

  describe('getCustAndProjects', () => {
    it('should set Customerids and Projectids from event', () => {
      fixture.detectChanges();
      component.getCustAndProjects({ customer: ['C001', 'C002'], project: ['P001'] });
      expect(component.Customerids).toEqual(['C001', 'C002']);
      expect(component.Projectids).toEqual(['P001']);
    });
  });

  // ─── getStartAndEndDates ──────────────────────────────────────────────────

  describe('getStartAndEndDates', () => {
    it('should return an object with startDate and endDate strings', () => {
      fixture.detectChanges();
      const result = component.getStartAndEndDates();
      expect(result.startDate).toBeTruthy();
      expect(result.endDate).toBeTruthy();
    });
  });

  // ─── calculateRowSpan ─────────────────────────────────────────────────────

  describe('calculateRowSpan', () => {
    it('should return sum of all periods lengths', () => {
      fixture.detectChanges();
      const kpis = [
        { periods: [1, 2, 3] },
        { periods: [4, 5] }
      ];
      expect(component.calculateRowSpan(kpis)).toBe(5);
    });
  });

  // ─── getKPIAcheievementScore ──────────────────────────────────────────────

  describe('getKPIAcheievementScore', () => {
    it('should append " #" when actualsEmpty > 0', () => {
      fixture.detectChanges();
      const result = component.getKPIAcheievementScore({ kpiachievementscore: 80, actualsEmpty: 1, singleTarget: 0 });
      expect(result).toBe('80 #');
    });

    it('should append "@" when singleTarget > 0', () => {
      fixture.detectChanges();
      const result = component.getKPIAcheievementScore({ kpiachievementscore: 90, actualsEmpty: 0, singleTarget: 1 });
      expect(result).toBe('90@');
    });

    it('should append " %" otherwise', () => {
      fixture.detectChanges();
      const result = component.getKPIAcheievementScore({ kpiachievementscore: 95, actualsEmpty: 0, singleTarget: 0 });
      expect(result).toBe('95 %');
    });
  });

  // ─── getKpiActualValue ────────────────────────────────────────────────────

  describe('getKpiActualValue', () => {
    it('should return "NA" for kpiActualValue=-1', () => {
      fixture.detectChanges();
      expect(component.getKpiActualValue({ kpiActualValue: -1, isActualEmpty: false })).toBe('NA');
    });

    it('should return "NU" when isActualEmpty=true', () => {
      fixture.detectChanges();
      expect(component.getKpiActualValue({ kpiActualValue: 50, isActualEmpty: true })).toBe('NU');
    });

    it('should return the actual value otherwise', () => {
      fixture.detectChanges();
      expect(component.getKpiActualValue({ kpiActualValue: 75, isActualEmpty: false })).toBe(75);
    });

    it('should return "-" when actual is null', () => {
      fixture.detectChanges();
      expect(component.getKpiActualValue(null)).toBe('-');
    });
  });

  // ─── getOverallKPIAchieveddata ────────────────────────────────────────────

  describe('getOverallKPIAchieveddata', () => {
    it('should append "* %" when kpI_NOT_CALCULATED > 0', () => {
      fixture.detectChanges();
      const result = component.getOverallKPIAchieveddata({ kpI_ACHIEVED: 80, kpI_NOT_CALCULATED: 2 });
      expect(result).toBe('80* %');
    });

    it('should append " %" otherwise', () => {
      fixture.detectChanges();
      const result = component.getOverallKPIAchieveddata({ kpI_ACHIEVED: 90, kpI_NOT_CALCULATED: 0 });
      expect(result).toBe('90 %');
    });
  });

  // ─── filterKPIs ───────────────────────────────────────────────────────────

  describe('filterKPIs', () => {
    it('should restore all when kpiSearchText is empty', () => {
      fixture.detectChanges();
      component.GlobalCategories = mockGlobalCategories as any;
      component.filteredGlobalCategories = [];
      component.kpiSearchText = '';
      component.filterKPIs();
      expect(component.filteredGlobalCategories.length).toBe(2);
    });

    it('should filter categories by search text', () => {
      fixture.detectChanges();
      component.GlobalCategories = mockGlobalCategories as any;
      component.kpiSearchText = 'alpha';
      component.filterKPIs();
      expect(component.filteredGlobalCategories.length).toBe(1);
      expect(component.filteredGlobalCategories[0].category![0].shorT_DESC).toBe('KPI Alpha');
    });
  });

  // ─── filterServiceTowers ──────────────────────────────────────────────────

  describe('filterServiceTowers', () => {
    it('should restore all when search is empty', () => {
      fixture.detectChanges();
      component.ServiceAreaList = mockServiceAreaList;
      component.serviceTowerSearchText = '';
      component.filterServiceTowers();
      expect(component.filteredServiceAreaList.length).toBe(2);
    });

    it('should filter service towers by search text', () => {
      fixture.detectChanges();
      component.ServiceAreaList = mockServiceAreaList;
      component.serviceTowerSearchText = 'Tower A';
      component.filterServiceTowers();
      expect(component.filteredServiceAreaList.length).toBe(1);
    });
  });

  // ─── toggleAllKPIs ────────────────────────────────────────────────────────

  describe('toggleAllKPIs', () => {
    it('should select all KPI ids when none selected', () => {
      fixture.detectChanges();
      component.GlobalCategories = mockGlobalCategories as any;
      component.globaL_KPI_CATEGORY_IDs = [];
      component.toggleAllKPIs();
      expect(component.globaL_KPI_CATEGORY_IDs.length).toBe(3);
    });

    it('should deselect all when all are selected', () => {
      fixture.detectChanges();
      component.GlobalCategories = mockGlobalCategories as any;
      component.globaL_KPI_CATEGORY_IDs = [10, 11, 12];
      component.toggleAllKPIs();
      expect(component.globaL_KPI_CATEGORY_IDs.length).toBe(0);
    });
  });

  // ─── applyFilter (SUMMARY mode) ───────────────────────────────────────────

  describe('applyFilter', () => {
    it('should call Service_GetCustomerSummaryReport when selectedoption=SUMMARY', () => {
      fixture.detectChanges();
      component.selectedoption = 'SUMMARY';
      component.DateSelection.selectedStartMonth = 'Jan';
      component.DateSelection.selectedStartYear = 2024;
      component.DateSelection.selectedEndMonth = 'Dec';
      component.DateSelection.selectedEndYear = 2024;
      component.applyFilter();
      expect(mockAppsService.GetConsolidatedProjectWiseKPIDetails).toHaveBeenCalled();
    });

    it('should call Service_GetProjectKPIData when selectedoption=PROJECT', () => {
      fixture.detectChanges();
      component.selectedoption = 'PROJECT';
      component.DateSelection.selectedStartMonth = 'Jan';
      component.DateSelection.selectedStartYear = 2024;
      component.DateSelection.selectedEndMonth = 'Dec';
      component.DateSelection.selectedEndYear = 2024;
      mockAppsService.GetGlobalKPICategoryDetailsAcrossProject.calls.reset();
      component.applyFilter();
      expect(mockAppsService.GetGlobalKPICategoryDetailsAcrossProject).toHaveBeenCalled();
    });
  });
});
