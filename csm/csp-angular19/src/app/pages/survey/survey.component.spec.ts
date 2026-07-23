import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SurveyComponent } from './survey.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('SurveyComponent', () => {
  let component: SurveyComponent;
  let fixture: ComponentFixture<SurveyComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetCSSSurveyQuestions: jasmine.createSpy().and.returnValue(of({
        csS_QUESTION_REPLIES: [
          { id: 1, questioN_CATEGORY: 'Criteria', question: 'Q1', rating: 0 },
          { id: 2, questioN_CATEGORY: 'NPS', question: 'NPS Q', rating: 0 },
          { id: 3, questioN_CATEGORY: 'Others', question: 'Others Q' }
        ],
        csS_BATCH_CUSTOMERS_EXTENDED: null,
        csS_BATCH_CUSTOMER_MONTHLY_EXTENDED: null
      })),
      SaveCSSSurveyAnswers: jasmine.createSpy().and.returnValue(of({}))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      GetErrorMessage: jasmine.createSpy().and.returnValue('error'),
      AppSettings: { token: 'test-token' }
    };
    mockDialog = {
      open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(1) })
    };

    TestBed.configureTestingModule({
      imports: [SurveyComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { params: of({ code: 'test-code' }) } },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.IsCompleted).toBe(false);
    expect(component.isMonthly).toBe(false);
    expect(component.hasRatingBeenSelected).toBe(false);
    expect(component.disableSubmit).toBe(false);
    expect(component.warnNps).toBe(true);
  });

  it('should call GetCSSSurveyQuestions on init', () => {
    expect(mockAppService.GetCSSSurveyQuestions).toHaveBeenCalled();
  });

  it('should set questions data after service response', () => {
    expect(component.questions_Criteria).toBeDefined();
    expect(component.questions_NPS).toBeDefined();
    expect(component.questions_Others).toBeDefined();
  });

  it('should update npsRating on Rating_OnClick', () => {
    component.Rating_OnClick(8);
    expect(component.npsRating).toBe(8);
    expect(component.hasRatingBeenSelected).toBe(true);
  });

  it('should set warnNps to false on valid NPS input change', () => {
    component.questions_NPS = { ratinG_DESCRIPTION: 'Great service' };
    component.onInputNpsChange();
    expect(component.warnNps).toBe(false);
  });

  it('should set warnNps to true when only special chars entered', () => {
    component.questions_NPS = { ratinG_DESCRIPTION: '!!!@@@' };
    component.onInputNpsChange();
    expect(component.warnNps).toBe(true);
  });

  it('should get detail returns empty string for null', () => {
    expect(component.getDetail(null)).toBe('');
    expect(component.getDetail('')).toBe('');
    expect(component.getDetail('test')).toBe('test');
  });

  it('should return correct remaining char count', () => {
    expect(component.getRemaining('hello')).toBe(5);
    expect(component.getRemaining(null)).toBe(0);
  });

  it('should handle service error in GetCSSSurveyQuestions with retry', () => {
    component.gettry = 2;
    mockAppService.GetCSSSurveyQuestions.and.returnValue(throwError(() => new Error('survey closed')));
    mockUtil.GetErrorMessage.and.returnValue('This survey is now closed');
    component.service_GetSurveyQuestions('bad-code');
    expect(component.IsCompleted).toBe(true);
  });
});
