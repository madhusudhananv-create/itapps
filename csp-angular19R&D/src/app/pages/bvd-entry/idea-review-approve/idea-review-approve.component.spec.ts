import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IdeaReviewApproveComponent } from './idea-review-approve.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('IdeaReviewApproveComponent', () => {
  let component: IdeaReviewApproveComponent;
  let fixture: ComponentFixture<IdeaReviewApproveComponent>;
  let mockBvdService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockBvdService = {
      ideA_ID: 10,
      bvdreview: null,
      isIdeaApproved: false,
      isIdeaSubmitted: true,
      bvdstages: [],
      getIdeaStatus: jasmine.createSpy('getIdeaStatus').and.returnValue(of([])),
      getIdeaStages: jasmine.createSpy('getIdeaStages').and.returnValue(of([])),
      saveReviewerResponse: jasmine.createSpy('saveReviewerResponse').and.returnValue(of({}))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      IsCSM: jasmine.createSpy('IsCSM').and.returnValue(false)
    };

    TestBed.configureTestingModule({
      imports: [
        IdeaReviewApproveComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BvdEntryService, useValue: mockBvdService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    }).overrideComponent(IdeaReviewApproveComponent, {
      set: { template: '<div></div>' }
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empid') return 'emp001';
      if (key === 'token') return 'test-token';
      return null;
    });
    fixture = TestBed.createComponent(IdeaReviewApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.isLoading).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.stages).toEqual([]);
    expect(component.status).toEqual([]);
  });

  it('should call getIdeaStatus on ngOnInit', () => {
    expect(mockBvdService.getIdeaStatus).toHaveBeenCalled();
  });

  it('should call getIdeaStages on ngOnInit when ideA_ID > 0', () => {
    expect(mockBvdService.getIdeaStages).toHaveBeenCalledWith(10);
  });

  it('should filter status to stage 4 only', () => {
    mockBvdService.getIdeaStatus.and.returnValue(of([
      { id: 1, stagE_ID: 1, title: 'Draft' },
      { id: 4, stagE_ID: 4, title: 'Approved' },
      { id: 5, stagE_ID: 4, title: 'Rejected' }
    ]));
    component.getIdeaStatus();
    expect(component.status.length).toBe(2);
    expect(component.status.every((s: any) => s.stagE_ID === 4)).toBe(true);
  });

  it('should set bvdstages after getIdeaStages succeeds', () => {
    const stages = [{ id: 1 }, { id: 2 }];
    mockBvdService.getIdeaStages.and.returnValue(of(stages));
    component.getIdeaStages();
    expect(mockBvdService.bvdstages).toEqual(stages);
  });

  it('should set disabled=true when idea status is 4 (Approved)', () => {
    component.review.ideA_STATUS_ID = 4;
    mockBvdService.getIdeaStages.and.returnValue(of([]));
    component.getIdeaStages();
    expect(component.disabled).toBe(true);
  });

  it('should set disabled=true when idea status is 3 (Rejected)', () => {
    component.review.ideA_STATUS_ID = 3;
    mockBvdService.getIdeaStages.and.returnValue(of([]));
    component.getIdeaStages();
    expect(component.disabled).toBe(true);
  });

  it('should not call getIdeaStages when ideA_ID is 0', () => {
    mockBvdService.ideA_ID = 0;
    mockBvdService.getIdeaStages.calls.reset();
    component.getIdeaStages();
    expect(mockBvdService.getIdeaStages).not.toHaveBeenCalled();
  });

  it('should return correct status title from getStatusTitle', () => {
    component.status = [{ id: 4, title: 'Approved' }];
    expect(component.getStatusTitle(4)).toBe('Approved');
  });

  it('should return empty string from getStatusTitle when id not found', () => {
    component.status = [];
    expect(component.getStatusTitle(99)).toBe('');
  });

  it('should warn when no status is selected on submitReviewerResponse', () => {
    component.review.ideA_STATUS_ID = undefined as any;
    component.submitReviewerResponse();
    expect(mockUtil.showWarning).toHaveBeenCalled();
    expect(mockBvdService.saveReviewerResponse).not.toHaveBeenCalled();
  });

  it('should call saveReviewerResponse with review data when status is set', () => {
    component.review.ideA_STATUS_ID = 4;
    component.status = [{ id: 4, title: 'Approved' }];
    component.submitReviewerResponse();
    expect(mockBvdService.saveReviewerResponse).toHaveBeenCalled();
  });

  it('should set isIdeaSubmitted=false when reviewer sends back for rework (status 5)', () => {
    component.review.ideA_STATUS_ID = 5;
    component.status = [{ id: 5, title: 'Rework' }];
    mockBvdService.saveReviewerResponse.and.returnValue(of({}));
    component.submitReviewerResponse();
    expect(mockBvdService.isIdeaSubmitted).toBe(false);
  });

  it('should emit setStep(3) on setBack after delay', (done) => {
    spyOn(component.setStep, 'emit');
    component.setBack();
    setTimeout(() => {
      expect(component.setStep.emit).toHaveBeenCalledWith(3);
      done();
    }, 500);
  });

  it('should emit setStep(5) on setNext after delay', (done) => {
    spyOn(component.setStep, 'emit');
    component.setNext();
    setTimeout(() => {
      expect(component.setStep.emit).toHaveBeenCalledWith(5);
      done();
    }, 500);
  });

  it('should set isLoading=false on getIdeaStages error', () => {
    mockBvdService.getIdeaStages.and.returnValue(throwError(() => new Error('err')));
    component.getIdeaStages();
    expect(component.isLoading).toBe(false);
  });
});
