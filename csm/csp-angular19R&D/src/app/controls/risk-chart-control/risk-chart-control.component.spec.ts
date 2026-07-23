import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';

import { RiskchartControlComponent, riskDashboardInputsModel } from './risk-chart-control.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';

describe('RiskchartControlComponent', () => {
  let component: RiskchartControlComponent;
  let fixture: ComponentFixture<RiskchartControlComponent>;

  const riskSubject = new Subject<any>();

  const mockAppsService = {
    GetRiskDashboardData: jasmine.createSpy('GetRiskDashboardData').and.returnValue(of([]))
  };

  const mockMyUtility = {
    AppSettings: { empid: 'E001' },
    riskSubject: riskSubject,
    GetRiskChart: jasmine.createSpy('GetRiskChart')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RiskchartControlComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskchartControlComponent);
    component = fixture.componentInstance;
    // Provide required inputs before detectChanges
    component.inputs = new riskDashboardInputsModel();
    component.isValid = false;
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

  it('should have isValid input', () => {
    expect(component.isValid).toBeDefined();
  });

  it('should have inputs of type riskDashboardInputsModel', () => {
    expect(component.inputs).toBeDefined();
    expect(component.inputs instanceof riskDashboardInputsModel).toBeTruthy();
  });

  it('riskDashboardInputsModel should have correct default values', () => {
    const model = new riskDashboardInputsModel();
    expect(model.customeR_IDS).toBe('');
    expect(model.businesS_UNITS).toBe('');
    expect(model.risK_STATUS).toBe('');
  });

  it('should not call GetRiskChart when isValid is false', () => {
    component.isValid = false;
    component.loadData();
    expect(mockMyUtility.GetRiskChart).not.toHaveBeenCalled();
  });
});
