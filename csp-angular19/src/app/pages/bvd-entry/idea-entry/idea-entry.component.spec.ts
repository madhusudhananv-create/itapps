import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IdeaEntryComponent } from './idea-entry.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('IdeaEntryComponent', () => {
  let component: IdeaEntryComponent;
  let fixture: ComponentFixture<IdeaEntryComponent>;
  let mockBvdEntry: any;
  let mockAppsService: any;
  let mockUtil: any;
  let mockRoute: any;

  beforeEach(waitForAsync(() => {
    mockBvdEntry = {
      customerid: 0,
      reset: '',
      bvdidea: {},
      ideA_ID: 0,
      projecT_ID: '',
      isIdeaSubmitted: false,
      bvdbenefit: [],
      bvdimplementationschdules: [],
      getIdeaStatus: jasmine.createSpy('getIdeaStatus').and.returnValue(of([])),
      getIdeaImprovementAndCategoryList: jasmine.createSpy('getIdeaImprovementAndCategoryList').and.returnValue(of({ improvements: [], categories: [] })),
      getSimilarIdeas: jasmine.createSpy('getSimilarIdeas').and.returnValue(of([])),
      getIdeaById: jasmine.createSpy('getIdeaById').and.returnValue(of({ id: 1, description: 'Test', projecT_ID: 'P1', cusT_ID: 'C1', portfoliO_ID: 0, servicE_AREA_ID: 0, procesS_AREA_ID: 0 })),
      saveIdeaDetails: jasmine.createSpy('saveIdeaDetails').and.returnValue(of({ id: 1, projecT_ID: 'P1' })),
      getprojectsNameForAPortfolioNew: jasmine.createSpy('getprojectsNameForAPortfolioNew').and.returnValue(of([]))
    };

    mockAppsService = {
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([])),
      getAllProjectsForCustomer: jasmine.createSpy('getAllProjectsForCustomer').and.returnValue(of([])),
      getServiceAreaProjectMapping: jasmine.createSpy('getServiceAreaProjectMapping').and.returnValue(of([])),
      GetProcessAreaByServiceAreaIdNew: jasmine.createSpy('GetProcessAreaByServiceAreaIdNew').and.returnValue(of([])),
      GetProcessByProcessArea: jasmine.createSpy('GetProcessByProcessArea').and.returnValue(of([])),
      getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
      GetPortfolioList: jasmine.createSpy('GetPortfolioList').and.returnValue(of([])),
      getEmpInfo: jasmine.createSpy('getEmpInfo').and.returnValue(of([]))
    };

    mockUtil = {
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showError: jasmine.createSpy('showError')
    };

    mockRoute = {
      queryParams: of({})
    };

    TestBed.configureTestingModule({
      imports: [
        IdeaEntryComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BvdEntryService, useValue: mockBvdEntry },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: ActivatedRoute, useValue: mockRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empid') return 'emp001';
      if (key === 'token') return 'test-token';
      return null;
    });
    fixture = TestBed.createComponent(IdeaEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.ideaId).toBe(0);
    expect(component.loading).toBe(false);
    expect(component.similarIdeas).toEqual([]);
    expect(component.employees).toEqual([]);
  });

  it('should call getIdeaStatus on ngOnInit', () => {
    expect(mockBvdEntry.getIdeaStatus).toHaveBeenCalled();
  });

  it('should call getIdeaImprovementAndCategoryList on ngOnInit', () => {
    expect(mockBvdEntry.getIdeaImprovementAndCategoryList).toHaveBeenCalled();
  });

  it('should call GetCustomerList on ngOnInit when empId is set', () => {
    expect(mockAppsService.GetCustomerList).toHaveBeenCalled();
  });

  it('should set default status ID to 1 (Draft) when idea has no status', () => {
    mockBvdEntry.getIdeaStatus.and.returnValue(of([{ id: 1, title: 'Draft', stagE_ID: 1 }]));
    component.idea.ideA_STATUS_ID = 0;
    component.getIdeaStatus();
    expect(component.idea.ideA_STATUS_ID).toBe(1);
  });

  it('should populate improvementS_TYPE and categories from getIdeaImprovementAndCategoryList', () => {
    mockBvdEntry.getIdeaImprovementAndCategoryList.and.returnValue(of({
      improvements: [{ id: 1, name: 'Type A' }],
      categories: [{ id: 2, name: 'Cat B' }]
    }));
    component.getIdeaImprovementAndCategoryList();
    expect(component.improvementS_TYPE.length).toBe(1);
    expect(component.categories.length).toBe(1);
  });

  it('should populate customerList from GetCustomerList when customerId is set', () => {
    component.customerId = 'C1';
    mockAppsService.GetCustomerList.and.returnValue(of([{ cusT_ID: 'C1', name: 'Cust 1' }]));
    component.getCustomerList();
    expect(component.customerList.length).toBe(1);
  });

  it('should load projects via getAllProjectsForCustomer', () => {
    component.selectedCust = 'C1';
    mockAppsService.getAllProjectsForCustomer.and.returnValue(of([{ proJ_ID: 'P1', name: 'Proj 1' }]));
    component.getProjects();
    expect(component.projects.length).toBe(1);
  });

  it('should load serviceAreaList from getServiceAreaProjectMapping', () => {
    mockAppsService.getServiceAreaProjectMapping.and.returnValue(of([{ id: 1, name: 'Area 1' }]));
    component.Service_GetServiceAreaProjectMapping('P1');
    expect(component.serviceAreaList.length).toBe(1);
  });

  it('should set serviceAreaList to empty array on service error', () => {
    mockAppsService.getServiceAreaProjectMapping.and.returnValue(throwError(() => new Error('err')));
    component.Service_GetServiceAreaProjectMapping('P1');
    expect(component.serviceAreaList).toEqual([]);
  });

  it('should load processAreaList from GetProcessAreaByServiceAreaIdNew', () => {
    mockAppsService.GetProcessAreaByServiceAreaIdNew.and.returnValue(of([{ id: 1 }]));
    component.getProcessAreas(1);
    expect(component.processAreaList.length).toBe(1);
  });

  it('should load processList from GetProcessByProcessArea', () => {
    mockAppsService.GetProcessByProcessArea.and.returnValue(of([{ id: 1 }]));
    component.getProcesses(1);
    expect(component.processList.length).toBe(1);
  });

  it('should set employees from getProjectResourceByProjId', () => {
    mockAppsService.getProjectResourceByProjId.and.returnValue(of([{ id: 1, name: 'Emp A' }]));
    component.getEmpIds('P1');
    expect(component.employees.length).toBe(1);
  });

  it('should clear similarIdeas when description is empty', () => {
    component.idea.description = '';
    component.getSimilarIdeas();
    expect(component.similarIdeas).toEqual([]);
  });

  it('should set idea.identifieD_BY on employeeSearch_onChange', () => {
    component.employeeSearch_onChange(['emp1']);
    expect(component.idea.identifieD_BY).toEqual(['emp1'] as any);
  });

  it('should warn and not save when description is too short on submitForm', () => {
    component.idea.description = 'Short';
    component.submitForm();
    expect(mockUtil.showWarning).toHaveBeenCalled();
    expect(mockBvdEntry.saveIdeaDetails).not.toHaveBeenCalled();
  });

  it('should emit setStep(2) after saveIdea succeeds', () => {
    spyOn(component.setStep, 'emit');
    mockBvdEntry.saveIdeaDetails.and.returnValue(of({ id: 5, projecT_ID: 'P1' }));
    component.saveIdea();
    expect(component.setStep.emit).toHaveBeenCalledWith(2);
  });

  it('should set loading to false on saveIdea error', () => {
    mockBvdEntry.saveIdeaDetails.and.returnValue(throwError(() => new Error('error')));
    component.saveIdea();
    expect(component.loading).toBe(false);
  });

  it('should set customerId and clear projects on onCustomerChange', () => {
    component.selectedCust = 'C2';
    component.onCustomerChange();
    expect(component.customerId).toBe('C2');
    expect(component.projects).toEqual([]);
  });

  it('should call getProcessAreas on onServiceAreaChange and clear process selections', () => {
    spyOn(component, 'getProcessAreas');
    component.onServiceAreaChange(3);
    expect(component.idea.servicE_AREA_ID).toBe(3);
    expect(component.idea.procesS_AREA_ID).toBe(0);
    expect(component.getProcessAreas).toHaveBeenCalledWith(3);
  });

  it('should call getProcesses on onProcessAreaChange and clear process selection', () => {
    spyOn(component, 'getProcesses');
    component.onProcessAreaChange(5);
    expect(component.idea.procesS_AREA_ID).toBe(5);
    expect(component.idea.procesS_ID).toBe(0);
    expect(component.getProcesses).toHaveBeenCalledWith(5);
  });

  it('should clear similarIdeas on onDescriptionChange when description is empty', () => {
    component.idea.description = '';
    component.onDescriptionChange();
    expect(component.similarIdeas).toEqual([]);
  });

  it('should return isPremierCustomer via util.IsPremier', () => {
    mockUtil.IsPremier.calls.reset();
    mockUtil.IsPremier.and.returnValue(true);
    component.customerId = 'C1';
    const result = component.isPremierCustomer;
    expect(result).toBe(true);
    expect(mockUtil.IsPremier).toHaveBeenCalled();
  });
});
