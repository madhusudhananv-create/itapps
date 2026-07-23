import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CssdashboardComponent } from './cssdashboard.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SurveyService } from '../../core/services/survey.service';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('CssdashboardComponent', () => {
  let component: CssdashboardComponent;
  let fixture: ComponentFixture<CssdashboardComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockSurveyService: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getAccountsForCSATDashboard: jasmine.createSpy('getAccountsForCSATDashboard').and.returnValue(of({
        customers: [],
        allTop15Accounts: '',
        allAccountsExceptTop15Accounts: '',
        allQASpocAccounts: '',
        allGSLabAccounts: '',
        allGSLabKeyAccounts: '',
        allstrategicAccounts: ''
      }))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      Years: jasmine.createSpy('Years').and.returnValue([2023, 2024, 2025]),
      Year: jasmine.createSpy('Year').and.returnValue(2024),
      getDatesBasedOnQuarter: jasmine.createSpy('getDatesBasedOnQuarter').and.returnValue([
        { fromDate: new Date('2024-01-01'), toDate: new Date('2024-03-31') }
      ]),
      getQuarter: jasmine.createSpy('getQuarter').and.returnValue('Q1')
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };

    mockSurveyService = {
      GetCSMListDistinct: jasmine.createSpy('GetCSMListDistinct').and.returnValue(of([]))
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [
        CssdashboardComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();
    TestBed.overrideProvider(MyUtility, { useValue: mockUtil });
    TestBed.overrideProvider(SurveyService, { useValue: mockSurveyService });
    TestBed.overrideProvider(MatDialog, { useValue: mockDialog });
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'role' ? 'CSM' : null
    );
    fixture = TestBed.createComponent(CssdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.isLoaded).toBe(false);
    expect(component._loading).toBe(false);
    expect(component.currIndex).toBe(0);
    expect(component.allCust).toBe(false);
    expect(component.isMenuDisabled).toBe(false);
  });

  it('should set allCust=true when access IsAllowed(77) is true on ngOnInit', () => {
    mockAccess.IsAllowed.and.returnValue(true);
    component.ngOnInit();
    expect(component.allCust).toBe(true);
  });

  it('should not set allCust when IsAllowed returns false', () => {
    mockAccess.IsAllowed.and.returnValue(false);
    component.ngOnInit();
    expect(component.allCust).toBe(false);
  });

  it('should increment currIndex on onNext()', () => {
    component.currIndex = 0;
    component.onNext();
    expect(component.currIndex).toBe(1);
  });

  it('should decrement currIndex on onPrev()', () => {
    component.currIndex = 2;
    component.onPrev();
    expect(component.currIndex).toBe(1);
  });

  it('should bind cssInputs on receivedCssInput()', () => {
    const event = {
      customerId: 'C1',
      selectedYear: 2024,
      selectedQuarter: 'Q1',
      fromDate: new Date('2024-01-01'),
      toDate: new Date('2024-03-31'),
      trendQuarter: 1,
      customerIds: 'C1',
      csmIds: '-1',
      frequency: 'Both'
    };
    component.receivedCssInput(event);
    expect(component.customerId).toBe('C1');
    expect(component.selectedYear).toBe(2024);
    expect(component.frequency).toBe('Both');
  });

  it('should reset cssInputs on resetValues()', () => {
    component.resetValues();
    expect(component.cssInputs).toBeTruthy();
  });

  it('should return empty string on GetCSATPeriod()', () => {
    const result = component.GetCSATPeriod('Q1', 2024);
    expect(result).toContain('Q1');
    expect(result).toContain('2024');
  });

  it('should return correct quarter label from formatLabel()', () => {
    expect(component.formatLabel(0)).toBe('Q1');
    expect(component.formatLabel(5)).toBe('Q2');
    expect(component.formatLabel(10)).toBe('Q3');
    expect(component.formatLabel(15)).toBe('Q4');
  });

  it('should return value unchanged when not a quarter tick in formatLabel()', () => {
    expect(component.formatLabel(7)).toBe(7);
  });
});
