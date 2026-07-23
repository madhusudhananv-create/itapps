import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardFilterComponent } from './dashboard-filter.component';
import { AppsService } from '../../../services/apps.service';
import { SharedService } from '../../../shared/shared.service';
import { AccessControl } from '../../../shared/access-control';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardFilterComponent', () => {
  let component: DashboardFilterComponent;
  let fixture: ComponentFixture<DashboardFilterComponent>;
  let mockAppService: any;
  let mockSharedService: any;
  let mockAccessControl: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetCustomerProjectsList: jasmine.createSpy('GetCustomerProjectsList').and.returnValue(of([])),
      GetCustomerProjectListForProjIds: jasmine.createSpy('GetCustomerProjectListForProjIds').and.returnValue(of([]))
    };

    mockSharedService = {};

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    TestBed.configureTestingModule({
      imports: [
        DashboardFilterComponent,
        NoopAnimationsModule
      ],
      providers: [
        FormBuilder,
        { provide: AppsService, useValue: mockAppService },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControl, useValue: mockAccessControl },
        provideHttpClient()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empid') return 'emp001';
      if (key === 'projectId') return 'P1';
      if (key === 'customerId') return 'C1';
      return null;
    });
    fixture = TestBed.createComponent(DashboardFilterComponent);
    component = fixture.componentInstance;
    
    // Initialize _cooDashboardCommon properties
    component['_cooDashboardCommon'].customerIds = [];
    component['_cooDashboardCommon'].projectIds = [];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.selectedDateType).toBe('1');
    expect(component.loading).toBe(false);
    expect(component.reset).toBe(false);
    expect(component.customers).toEqual([]);
    expect(component.projects).toEqual([]);
  });

  it('should call GetCustomerProjectsList when AllAllowed is true', () => {
    mockAppService.GetCustomerProjectsList.calls.reset();
    mockAccessControl.IsAllowed.and.returnValue(true);
    mockAppService.GetCustomerProjectsList.and.returnValue(of([{ cusT_ID: 'C1', projects: [] }]));
    component.LoadCustomerProjectsByEmpId();
    expect(mockAppService.GetCustomerProjectsList).toHaveBeenCalled();
  });

  it('should call GetCustomerProjectListForProjIds when AllAllowed is false', () => {
    mockAccessControl.IsAllowed.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
      if (key === 'projIds') return 'P1,P2';
      if (key === 'empid') return 'emp001';
      if (key === 'projectId') return 'P1';
      if (key === 'customerId') return 'C1';
      return null;
    });
    mockAppService.GetCustomerProjectListForProjIds.and.returnValue(of([]));
    component.LoadCustomerProjectsByEmpId();
    expect(mockAppService.GetCustomerProjectListForProjIds).toHaveBeenCalled();
  });

  it('should set customers on successful GetCustomerProjectsList', () => {
    const data = [{ cusT_ID: 'C1', cusT_NM: 'Customer 1', projects: [] }];
    mockAppService.GetCustomerProjectsList.and.returnValue(of(data));
    mockAccessControl.IsAllowed.and.returnValue(true);
    component.LoadCustomerProjectsByEmpId();
    expect(component.customers.length).toBe(1);
    expect(component.customers[0].cusT_ID).toBe('C1');
  });

  it('should populate projects from selected customer on getProjects()', () => {
    component.customers = [
      { cusT_ID: 'C1', projects: [{ proJ_ID: 'P1', proJ_NM: 'Project 1' }] }
    ];
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component.getProjects();
    expect(component.projects.length).toBe(1);
  });

  it('should clear projects when no customers selected on getProjects()', () => {
    component['_cooDashboardCommon'].customerIds = [];
    component.getProjects();
    expect(component.projects).toEqual([]);
  });

  it('should filter customers by name on SearchCust()', () => {
    component.customers = [
      { cusT_NM: 'Acme Corp' },
      { cusT_NM: 'Beta Ltd' }
    ];
    component.searchCustVal = 'acme';
    component.SearchCust();
    expect(component.customer.length).toBe(1);
  });

  it('should restore all customers when searchCustVal is empty on SearchCust()', () => {
    component.customers = [{ cusT_NM: 'Acme Corp' }, { cusT_NM: 'Beta Ltd' }];
    component.searchCustVal = '';
    component.SearchCust();
    expect(component.customer.length).toBe(2);
  });

  it('should filter projects by name on SearchProject()', () => {
    component.projects = [
      { proJ_NM: 'Alpha Project' },
      { proJ_NM: 'Beta Project' }
    ];
    component.searchProjVal = 'alpha';
    component.SearchProject();
    expect(component.project.length).toBe(1);
  });

  it('should restore all projects when searchProjVal is empty on SearchProject()', () => {
    component.projects = [{ proJ_NM: 'Alpha Project' }, { proJ_NM: 'Beta Project' }];
    component.searchProjVal = '';
    component.SearchProject();
    expect(component.project.length).toBe(2);
  });

  it('should return false from isInputsValid() when no customers selected', () => {
    spyOn(window, 'alert');
    component['_cooDashboardCommon'].customerIds = [];
    expect(component.isInputsValid()).toBe(false);
    expect(window.alert).toHaveBeenCalled();
  });

  it('should return false from isInputsValid() when no projects selected', () => {
    spyOn(window, 'alert');
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component['_cooDashboardCommon'].projectIds = [];
    expect(component.isInputsValid()).toBe(false);
    expect(window.alert).toHaveBeenCalled();
  });

  it('should return true from isInputsValid() when both customers and projects are selected', () => {
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component['_cooDashboardCommon'].projectIds = ['P1'];
    expect(component.isInputsValid()).toBe(true);
  });

  it('should emit onChange on Apply() when inputs are valid', () => {
    spyOn(component.onChange, 'emit');
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component['_cooDashboardCommon'].projectIds = ['P1'];
    component.Apply();
    expect(component.onChange.emit).toHaveBeenCalled();
  });

  it('should reset customerIds and projectIds on Reset()', () => {
    component['_cooDashboardCommon'].customerIds = ['C1'];
    component['_cooDashboardCommon'].projectIds = ['P1'];
    component.Reset();
    expect(component.reset).toBe(true);
    expect(component.customer).toEqual([]);
  });

  it('should set Month on ddMonth_OnChange()', () => {
    component.ddMonth_OnChange(6);
    expect(component.Month).toBe(6);
  });

  it('should set QiD on ddQuarter_Onchange()', () => {
    component.ddQuarter_Onchange(2);
    expect(component.QiD).toBe(2);
  });

  it('should set Year on ddYear_Onchange()', () => {
    component.ddYear_Onchange(2025);
    expect(component.Year).toBe(2025);
  });

  it('should update ViewId on ddView_Onchange()', () => {
    component.ddView_Onchange(3);
    expect(component['_cooDashboardCommon'].ViewId).toBe(3);
  });

  it('should calculate current quarter correctly via getCurrentQuarter()', () => {
    component.getCurrentQuarter();
    expect([1, 2, 3, 4]).toContain(component.QiD);
  });

  it('should set Month to current month via getCurrentMonth()', () => {
    component.getCurrentMonth();
    expect(component.Month).toBe(new Date().getMonth() + 1);
  });

  it('should unsubscribe on ngOnDestroy()', () => {
    spyOn(component['subscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscription'].unsubscribe).toHaveBeenCalled();
  });
});
