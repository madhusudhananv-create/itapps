import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { RiskchartComponent } from './risk-chart.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';

describe('RiskchartComponent', () => {
  let component: RiskchartComponent;
  let fixture: ComponentFixture<RiskchartComponent>;

  const mockAppsService = {
    GetRiskDashboard:              jasmine.createSpy('GetRiskDashboard').and.returnValue(of([])),
    GetCustomerAll:                jasmine.createSpy('GetCustomerAll').and.returnValue(of([])),
    getAccountsForCSATDashboard:   jasmine.createSpy('getAccountsForCSATDashboard').and.returnValue(of([])),
    getBusinessUnits:              jasmine.createSpy('getBusinessUnits').and.returnValue(of([]))
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001', logintype: 'gavs' },
    riskSubject: { subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: () => {} }) },
    GetRiskChart: jasmine.createSpy('GetRiskChart'),
    IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RiskchartComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize risk as empty array', () => {
    expect(component.risk).toEqual([]);
  });

  it('should initialize _loading as false', () => {
    expect(component._loading).toBeFalsy();
  });

  it('should initialize isValid as false', () => {
    expect(component.isValid).toBeFalsy();
  });

  it('should initialize riskStatus as empty array', () => {
    expect(component.riskStatus).toEqual([]);
  });

  it('should initialize businessUnit as empty array', () => {
    expect(component.businessUnit).toEqual([]);
  });

  it('should initialize fromDate as null', () => {
    expect(component.fromDate).toBeNull();
  });

  it('should initialize toDate as null', () => {
    expect(component.toDate).toBeNull();
  });

  it('should accept customerId input', () => {
    component.customerId = 'CUST001';
    fixture.detectChanges();
    expect(component.customerId).toBe('CUST001');
  });

  it('should initialize riskDashboardInputs', () => {
    expect(component.riskDashboardInputs).toBeDefined();
  });
});
