import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BvdEntryComponent } from './bvd-entry.component';
import { BvdEntryService } from './services/bvd-entry.service';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('BvdEntryComponent', () => {
  let component: BvdEntryComponent;
  let fixture: ComponentFixture<BvdEntryComponent>;
  let mockBvdEntryService: any;
  let mockRoute: any;

  beforeEach(waitForAsync(() => {
    mockBvdEntryService = {
      customerid: 0,
      reset: '',
      bvdidea: {},
      bvdbenefit: [],
      bvdimplementationschdules: [],
      currentStep: 1,
      isIdeaSubmitted: false,
      projecT_ID: '',
      ideA_ID: 0,
      isIdeaApproved: false,
      bvdreview: null,
      bvdViewType: 0,
      resources: [],
      getIdeaStatus: jasmine.createSpy('getIdeaStatus').and.returnValue(of([])),
      getIdeaCategories: jasmine.createSpy('getIdeaCategories').and.returnValue(of([])),
      getIdeaStages: jasmine.createSpy('getIdeaStages').and.returnValue(of([])),
      getSimilarIdeas: jasmine.createSpy('getSimilarIdeas').and.returnValue(of([])),
      getIdeaImprovementAndCategoryList: jasmine.createSpy('getIdeaImprovementAndCategoryList').and.returnValue(of({})),
      getApplicableBenefits: jasmine.createSpy('getApplicableBenefits').and.returnValue(of([])),
      saveIdeaBenefits: jasmine.createSpy('saveIdeaBenefits').and.returnValue(of([])),
      deleteIdeaBenefit: jasmine.createSpy('deleteIdeaBenefit').and.returnValue(of({})),
      getCategoryByBenefitPillar: jasmine.createSpy('getCategoryByBenefitPillar').and.returnValue(of([])),
      saveIdeaImplementationDetails: jasmine.createSpy('saveIdeaImplementationDetails').and.returnValue(of({})),
      saveReviewerResponse: jasmine.createSpy('saveReviewerResponse').and.returnValue(of({})),
      getAllIdeas: jasmine.createSpy('getAllIdeas').and.returnValue(of([])),
      getAllIdeasByCustomer: jasmine.createSpy('getAllIdeasByCustomer').and.returnValue(of([])),
      getIdeaDetailsById: jasmine.createSpy('getIdeaDetailsById').and.returnValue(of({})),
      getIdeaById: jasmine.createSpy('getIdeaById').and.returnValue(of({})),
      getIdeaStatusList: jasmine.createSpy('getIdeaStatusList').and.returnValue(of([])),
      saveIdeaDetails: jasmine.createSpy('saveIdeaDetails').and.returnValue(of({})),
      getIdeaImprovements: jasmine.createSpy('getIdeaImprovements').and.returnValue(of([])),
      getImplementationSchdule: jasmine.createSpy('getImplementationSchdule').and.returnValue(of([])),
      updateImplementationSchdule: jasmine.createSpy('updateImplementationSchdule').and.returnValue(of({})),
      getEmployeeName: jasmine.createSpy('getEmployeeName').and.returnValue('')
    };

    mockRoute = {
      params: of({ customerid: '1', reset: '' }),
      queryParams: of({})
    };

    TestBed.configureTestingModule({
      imports: [
        BvdEntryComponent,
        MatStepperModule,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BvdEntryService, useValue: mockBvdEntryService },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default property values', () => {
    expect(component.menuToggleStatus).toBe(false);
    expect(component.isIdeaSubmitted).toBe(false);
    expect((component as any)._pendingStepIndex).toBe(-1);
  });

  it('should set menuToggleStatus when onMenuToggleChange is called', () => {
    component.onMenuToggleChange(true);
    expect(component.menuToggleStatus).toBe(true);

    component.onMenuToggleChange(false);
    expect(component.menuToggleStatus).toBe(false);
  });

  it('should subscribe to route params on ngOnInit', () => {
    component.ngOnInit();
    expect(component.customerid).toBe(1);
  });

  it('should set _pendingStepIndex to 3 when viewType is view', () => {
    mockRoute.queryParams = of({ Ideaid: '10', isvieworapproveorreject: 'view', customerid: '1' });
    component.ngOnInit();
    expect((component as any)._pendingStepIndex).toBe(3);
  });

  it('should set _pendingStepIndex to 3 when viewType is approve', () => {
    mockRoute.queryParams = of({ Ideaid: '10', isvieworapproveorreject: 'approve', customerid: '1' });
    component.ngOnInit();
    expect((component as any)._pendingStepIndex).toBe(3);
  });

  it('should set _pendingStepIndex to 3 when viewType is reject', () => {
    mockRoute.queryParams = of({ Ideaid: '10', isvieworapproveorreject: 'reject', customerid: '1' });
    component.ngOnInit();
    expect((component as any)._pendingStepIndex).toBe(3);
  });

  it('should not set _pendingStepIndex when viewType is not view/approve/reject', () => {
    mockRoute.queryParams = of({ Ideaid: '10', isvieworapproveorreject: 'other' });
    component.ngOnInit();
    expect((component as any)._pendingStepIndex).toBe(-1);
  });

  it('should call getCurrentIndex without throwing', () => {
    expect(() => component.getCurrentIndex(2)).not.toThrow();
  });
});
