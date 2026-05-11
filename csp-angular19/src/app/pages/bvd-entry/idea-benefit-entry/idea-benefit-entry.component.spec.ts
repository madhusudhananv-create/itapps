import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IdeaBenefitEntryComponent } from './idea-benefit-entry.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('IdeaBenefitEntryComponent', () => {
  let component: IdeaBenefitEntryComponent;
  let fixture: ComponentFixture<IdeaBenefitEntryComponent>;
  let mockBvdService: any;
  let mockAppsService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockBvdService = {
      ideA_ID: 5,
      projecT_ID: 'P1',
      isIdeaSubmitted: false,
      bvdidea: null,
      bvdbenefit: [],
      bvdimplementationschdules: [],
      resources: [],
      getIdeaImprovementAndCategoryList: jasmine.createSpy('getIdeaImprovementAndCategoryList').and.returnValue(of({ improvements: [], categories: [] })),
      saveIdeaBenefits: jasmine.createSpy('saveIdeaBenefits').and.returnValue(of([])),
      deleteIdeaBenefit: jasmine.createSpy('deleteIdeaBenefit').and.returnValue(of({})),
      saveIdeaDetails: jasmine.createSpy('saveIdeaDetails').and.returnValue(of({ id: 5 })),
      getCategoryByBenefitPillar: jasmine.createSpy('getCategoryByBenefitPillar').and.returnValue(of([])),
      getBenefitViewDetailsByIdeaId: jasmine.createSpy('getBenefitViewDetailsByIdeaId').and.returnValue(of([]))
    };

    mockAppsService = {
      getServiceAreaProjectMapping: jasmine.createSpy('getServiceAreaProjectMapping').and.returnValue(of([])),
      GetProcessAreaByServiceAreaIdNew: jasmine.createSpy('GetProcessAreaByServiceAreaIdNew').and.returnValue(of([])),
      GetProcessByProcessArea: jasmine.createSpy('GetProcessByProcessArea').and.returnValue(of([]))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showError: jasmine.createSpy('showError'),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      enumSelector: jasmine.createSpy('enumSelector').and.returnValue([])
    };

    TestBed.configureTestingModule({
      imports: [
        IdeaBenefitEntryComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BvdEntryService, useValue: mockBvdService },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empid') return 'emp001';
      if (key === 'token') return 'test-token';
      return null;
    });
    fixture = TestBed.createComponent(IdeaBenefitEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.isSubmitted).toBe(false);
    expect(component.hidematAccordion).toBe(false);
    expect(component.allBenefits).toBeDefined();
  });

  it('should call getIdeaImprovementAndCategoryList on ngOnInit', () => {
    expect(mockBvdService.getIdeaImprovementAndCategoryList).toHaveBeenCalled();
  });

  it('should populate improvementS_TYPE and potentialCategories', () => {
    mockBvdService.getIdeaImprovementAndCategoryList.and.returnValue(of({
      improvements: [{ id: 1, name: 'Type A' }],
      categories: [{ id: 2, name: 'Cat B' }]
    }));
    component.getIdeaImprovementAndCategoryList();
    expect(component.improvementS_TYPE.length).toBe(1);
    expect(component.potentialCategories.length).toBe(1);
  });

  it('should load serviceAreaList from getServiceAreaProjectMapping', () => {
    mockAppsService.getServiceAreaProjectMapping.and.returnValue(of([{ id: 1, name: 'Area 1' }]));
    component.Service_GetServiceAreaProjectMapping('P1');
    expect(component.serviceAreaList.length).toBe(1);
  });

  it('should set serviceAreaList to empty on service error', () => {
    mockAppsService.getServiceAreaProjectMapping.and.returnValue(throwError(() => new Error('err')));
    component.Service_GetServiceAreaProjectMapping('P1');
    expect(component.serviceAreaList).toEqual([]);
  });

  it('should return early from Service_GetServiceAreaProjectMapping when projId is empty', () => {
    mockAppsService.getServiceAreaProjectMapping.calls.reset();
    component.Service_GetServiceAreaProjectMapping('');
    expect(mockAppsService.getServiceAreaProjectMapping).not.toHaveBeenCalled();
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

  it('should return a new BenefitViewDetails record from createNewRec', () => {
    const rec = component.createNewRec();
    expect(rec).toBeTruthy();
    expect(rec.isExpand).toBe(true);
    expect(rec.ideA_BENEFIT_SUMMARY).toBeDefined();
    expect(rec.benefiT_DETAILS_QUANTITATIVE_VM).toBeDefined();
  });

  it('should add a new benefit record to allBenefits when createNewBenefit is called', () => {
    mockBvdService.isIdeaSubmitted = false;
    const initialCount = component.allBenefits.length;
    component.createNewBenefit();
    expect(component.allBenefits.length).toBe(initialCount + 1);
  });

  it('should not add benefit when isIdeaSubmitted is true', () => {
    mockBvdService.isIdeaSubmitted = true;
    const initialCount = component.allBenefits.length;
    component.createNewBenefit();
    expect(component.allBenefits.length).toBe(initialCount);
  });

  it('should emit setStep(1) when setBack is called', () => {
    spyOn(component.setStep, 'emit');
    component.setBack();
    expect(component.setStep.emit).toHaveBeenCalledWith(1);
  });

  it('should emit setStep(3) when setNextStep is called', () => {
    spyOn(component.setStep, 'emit');
    component.setNextStep();
    expect(component.setStep.emit).toHaveBeenCalledWith(3);
  });

  it('should warn when allBenefits is empty on submitForm', () => {
    component.allBenefits = [];
    mockBvdService.isIdeaSubmitted = false;
    component.submitForm(0);
    expect(mockUtil.showWarning).toHaveBeenCalled();
  });

  it('should return true from isValidNumber for a valid numeric string', () => {
    expect(component.isValidNumber('123.45')).toBe(true);
  });

  it('should return false from isValidNumber for a non-numeric string', () => {
    expect(component.isValidNumber('abc')).toBe(false);
  });

  it('should call getCategoryByBenefitPillar when pillar and type are set', () => {
    const benefitSummary = {
      benefiT_PILLAR_ID: 1,
      benefiT_TYPE_ID: 2,
      categories: []
    } as any;
    component.getCategoryByBenefitPillar(benefitSummary);
    expect(mockBvdService.getCategoryByBenefitPillar).toHaveBeenCalledWith(1, 2);
  });

  it('should not call getCategoryByBenefitPillar when pillar is 0', () => {
    const benefitSummary = { benefiT_PILLAR_ID: 0, benefiT_TYPE_ID: 2, categories: [] } as any;
    component.getCategoryByBenefitPillar(benefitSummary);
    expect(mockBvdService.getCategoryByBenefitPillar).not.toHaveBeenCalled();
  });

  it('should call ngOnChanges without throwing', () => {
    expect(() => component.ngOnChanges()).not.toThrow();
  });
});
