import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DashboardFilterComponent } from './dashboard-filter.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

const mockCustomers = [
  { cusT_ID: 'C001', cusT_NM: 'Customer One' },
  { cusT_ID: 'C002', cusT_NM: 'Customer Two' }
];

const mockProjects = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockPortfolios = [
  { id: 1, name: 'Portfolio A' },
  { id: 2, name: 'Portfolio B' }
];

const mockPortfolioMapping = [
  { proj_id: 'P001', proj_nm: 'Project Alpha', portfolio_id: 1 },
  { proj_id: 'P002', proj_nm: 'Project Beta', portfolio_id: 2 }
];

describe('DashboardFilterComponent', () => {
  let component: DashboardFilterComponent;
  let fixture: ComponentFixture<DashboardFilterComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of(mockCustomers)),
      getAllProjectsForCustomer: jasmine.createSpy('getAllProjectsForCustomer').and.returnValue(of(mockProjects)),
      getPortfolioList: jasmine.createSpy('getPortfolioList').and.returnValue(of(mockPortfolios)),
      getProjectPortfolioMapping: jasmine.createSpy('getProjectPortfolioMapping').and.returnValue(of(mockPortfolioMapping))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
      ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false)
    };    TestBed.configureTestingModule({
      imports: [
        DashboardFilterComponent,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        provideHttpClient(),
        provideRouter([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFilterComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set empid from localStorage', () => {
      fixture.detectChanges();
      expect(component.empid).toBe('EMP01');
    });

    it('should call loadProjects with empid', () => {
      spyOn(component, 'loadProjects');
      fixture.detectChanges();
      expect(component.loadProjects).toHaveBeenCalledWith('EMP01');
    });
  });

  // ─── getCustomerList ──────────────────────────────────────────────────────

  describe('getCustomerList', () => {
    it('should populate customers list', () => {
      fixture.detectChanges();
      expect(component.customers.length).toBe(2);
    });

    it('should set selectedCust to first customer', () => {
      fixture.detectChanges();
      expect(component.selectedCust).toBe('C001');
    });

    it('should call getProjects after loading customers', () => {
      spyOn(component, 'getProjects');
      fixture.detectChanges();
      expect(component.getProjects).toHaveBeenCalled();
    });

    it('should call service_getPortfolioDetails when IsPremier is true', () => {
      mockMyUtility.IsPremier.and.returnValue(true);
      spyOn(component, 'service_getPortfolioDetails');
      fixture.detectChanges();
      expect(component.service_getPortfolioDetails).toHaveBeenCalled();
    });

    it('should not call service_getPortfolioDetails when IsPremier is false', () => {
      mockMyUtility.IsPremier.and.returnValue(false);
      spyOn(component, 'service_getPortfolioDetails');
      fixture.detectChanges();
      expect(component.service_getPortfolioDetails).not.toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getCustomerList.and.returnValue(throwError(() => new Error('fail')));
      component.getCustomerList('EMP01');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProjects ──────────────────────────────────────────────────────────

  describe('getProjects', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should populate projects from service', () => {
      expect(component.projects.length).toBe(2);
    });

    it('should set selectedProj to all project IDs', () => {
      expect(component.selectedProj).toContain('P001');
      expect(component.selectedProj).toContain('P002');
    });

    it('should set loading to true on success', () => {
      expect(component.loading).toBe(true);
    });

    it('should set customerId to selectedCust', () => {
      expect(component.customerId).toBe('C001');
    });

    it('should not call service when selectedCust is null', () => {
      component.selectedCust = null as any;
      component.getProjects();
      expect(mockAppsService.getAllProjectsForCustomer).toHaveBeenCalledTimes(1); // only initial call
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getAllProjectsForCustomer.and.returnValue(throwError(() => new Error('fail')));
      component.getProjects();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── service_getPortfolioDetails ──────────────────────────────────────────

  describe('service_getPortfolioDetails', () => {
    it('should populate portfolioList', () => {
      component.service_getPortfolioDetails();
      expect(component.portfolioList.length).toBe(2);
    });

    it('should select all portfolios including -1 sentinel', () => {
      component.service_getPortfolioDetails();
      expect(component.selectedPortfolio).toContain(-1);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getPortfolioList.and.returnValue(throwError(() => new Error('fail')));
      component.service_getPortfolioDetails();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProjectListForPremier ─────────────────────────────────────────────

  describe('getProjectListForPremier', () => {
    beforeEach(() => {
      component.portfolioprojectMap = mockPortfolioMapping as any;
    });

    it('should build projects from portfolio mapping', () => {
      component.getProjectListForPremier([1]);
      expect(component.projects.some(p => p.proj_id === 'P001')).toBe(true);
    });

    it('should sort projects by name', () => {
      component.getProjectListForPremier([1, 2]);
      const names = component.projects.map(p => p.proj_nm);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });

  // ─── onMenuToggleChange ───────────────────────────────────────────────────

  describe('onMenuToggleChange', () => {
    it('should update menuToggleStatus', () => {
      component.onMenuToggleChange(true);
      expect(component.menuToggleStatus).toBe(true);
      component.onMenuToggleChange(false);
      expect(component.menuToggleStatus).toBe(false);
    });
  });

  // ─── selectedCust_OnChange ────────────────────────────────────────────────

  describe('selectedCust_OnChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call getProjects on customer change', () => {
      spyOn(component, 'getProjects');
      component.selectedCust_OnChange('C002');
      expect(component.getProjects).toHaveBeenCalled();
    });

    it('should call service_getPortfolioDetails when new customer is Premier', () => {
      mockMyUtility.IsPremier.and.returnValue(true);
      spyOn(component, 'service_getPortfolioDetails');
      component.selectedCust_OnChange('C002');
      expect(component.service_getPortfolioDetails).toHaveBeenCalled();
    });
  });

  // ─── selectedProjects_OnChange ────────────────────────────────────────────

  describe('selectedProjects_OnChange', () => {
    it('should update projId', () => {
      component.selectedProjects_OnChange(['P001', 'P002']);
      expect(component.projId).toEqual(['P001', 'P002']);
    });
  });

  // ─── portfolio_OnChange ───────────────────────────────────────────────────

  describe('portfolio_OnChange', () => {
    it('should update portId', () => {
      spyOn(component, 'getProjectListForPremier');
      component.portfolio_OnChange([1, 2]);
      expect(component.portId).toEqual([1, 2]);
    });
  });

  // ─── filterProjects ───────────────────────────────────────────────────────

  describe('filterProjects', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return all projects when search text is empty', () => {
      component.projectSearchText = '';
      component.filterProjects();
      expect(component.filteredProjects.length).toBe(component.projects.length);
    });

    it('should filter projects by name (non-premier)', () => {
      component.projectSearchText = 'alpha';
      component.filterProjects();
      expect(component.filteredProjects.length).toBe(1);
      expect(component.filteredProjects[0].proJ_NM).toBe('Project Alpha');
    });
  });

  // ─── clearProjectSearch ───────────────────────────────────────────────────

  describe('clearProjectSearch', () => {
    it('should clear projectSearchText and restore filteredProjects', () => {
      fixture.detectChanges();
      component.projectSearchText = 'Alpha';
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.clearProjectSearch(mockEvent);
      expect(component.projectSearchText).toBe('');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });
});
