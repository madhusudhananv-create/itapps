import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CssdashboardFilterComponent } from './cssdashboard-filter.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { SurveyService } from '../../../core/services/survey.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('CssdashboardFilterComponent', () => {
  let component: CssdashboardFilterComponent;
  let fixture: ComponentFixture<CssdashboardFilterComponent>;
  let mockAppService: any;
  let mockUtil: any;
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

    mockSurveyService = {
      GetCSMListDistinct: jasmine.createSpy('GetCSMListDistinct').and.returnValue(of([]))
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
    };

    TestBed.configureTestingModule({
      imports: [
        CssdashboardFilterComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'role' ? 'CSM' : null
    );
    fixture = TestBed.createComponent(CssdashboardFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component._loading).toBe(false);
    expect(component.frequency).toBe('Both');
    expect(component.csmIds).toBe('-1');
    expect(component.accountSearchText).toBe('');
  });

  it('should call GetCSMListDistinct on ngOnInit', () => {
    expect(mockSurveyService.GetCSMListDistinct).toHaveBeenCalled();
  });

  it('should call getAccountsForCSATDashboard on ngOnInit', () => {
    expect(mockAppService.getAccountsForCSATDashboard).toHaveBeenCalled();
  });

  it('should populate CSMList on service_GetCSMList()', () => {
    const csmData = [{ id: 1, name: 'Alice' }];
    mockSurveyService.GetCSMListDistinct.and.returnValue(of(csmData));
    component.service_GetCSMList();
    expect(component.CSMList).toEqual(csmData);
  });

  it('should call serviceError on service_GetCSMList error', () => {
    mockSurveyService.GetCSMListDistinct.and.returnValue(throwError(() => new Error('err')));
    component.service_GetCSMList();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should set customer data on successful getAccountsForUser()', () => {
    const resultData = {
      customers: [{ cusT_ID: 'C1', cusT_NM: 'Cust 1', businesS_UNIT: 'BU1' }],
      allTop15Accounts: 'C1',
      allAccountsExceptTop15Accounts: '',
      allQASpocAccounts: '',
      allGSLabAccounts: '',
      allGSLabKeyAccounts: '',
      allstrategicAccounts: ''
    };
    mockAppService.getAccountsForCSATDashboard.and.returnValue(of(resultData));
    component.getAccountsForUser();
    expect(component.customer).toEqual(resultData.customers);
  });

  it('should call serviceError on getAccountsForUser error', () => {
    mockAppService.getAccountsForCSATDashboard.and.returnValue(throwError(() => new Error('err')));
    component.getAccountsForUser();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should filter customers by account search text on onAccountSearchChange()', () => {
    component.customer = [
      { cusT_ID: 'C1', cusT_NM: 'Acme Corp' },
      { cusT_ID: 'C2', cusT_NM: 'Beta Ltd' }
    ];
    component.accountSearchText = 'acme';
    component.onAccountSearchChange();
    expect(component.filteredCustomers.length).toBe(1);
    expect(component.filteredCustomers[0].cusT_NM).toBe('Acme Corp');
  });

  it('should restore all customers when search text is cleared', () => {
    component.customer = [
      { cusT_ID: 'C1', cusT_NM: 'Acme Corp' },
      { cusT_ID: 'C2', cusT_NM: 'Beta Ltd' }
    ];
    component.accountSearchText = '';
    component.onAccountSearchChange();
    expect(component.filteredCustomers.length).toBe(2);
  });

  it('should return customer IDs from getCustomerIds() when mySel is undefined', () => {
    component['mySel'] = undefined as any;
    const result = component.getCustomerIds();
    expect(result).toBe('');
  });

  it('should return -1 from getCsmIds() when myCSM is undefined', () => {
    component['myCSM'] = undefined as any;
    const result = component.getCsmIds();
    expect(result).toBe('-1');
  });

  it('should return false for IsPremier() with non-premier customer id', () => {
    component['mySel'] = undefined as any;
    expect(component.IsPremier()).toBe(false);
  });

  it('should emit prevClicked on onPrev()', () => {
    spyOn(component.prevClicked, 'emit');
    component.onPrev();
    expect(component.prevClicked.emit).toHaveBeenCalled();
  });

  it('should emit nextClicked on onNext()', () => {
    spyOn(component.nextClicked, 'emit');
    component.onNext();
    expect(component.nextClicked.emit).toHaveBeenCalled();
  });

  it('should call getDatesBasedOnQuarter on getdatesForQuarter()', () => {
    component.selectedQuarter = 'Q1';
    component.selectedYear = 2024;
    component.getdatesForQuarter();
    expect(mockUtil.getDatesBasedOnQuarter).toHaveBeenCalled();
  });

  it('should emit getCssInputEmitter on emitChanges()', () => {
    spyOn(component.getCssInputEmitter, 'emit');
    component.selectedQuarter = 'Q1';
    component.fromDate = new Date('2024-01-01');
    component.toDate = new Date('2024-03-31');
    component.emitChanges();
    expect(component.getCssInputEmitter.emit).toHaveBeenCalled();
  });
});
