import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

import { KpiActionPlanComponent } from './kpi-action-plan.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';

describe('KpiActionPlanComponent', () => {
  let component: KpiActionPlanComponent;
  let fixture: ComponentFixture<KpiActionPlanComponent>;

  const mockAppsService = {
    getAuditCauses: jasmine.createSpy('getAuditCauses').and.returnValue(of([])),
    getAuditFindingsCappa: jasmine.createSpy('getAuditFindingsCappa').and.returnValue(of([])),
    getCAPAStagesForKPI: jasmine.createSpy('getCAPAStagesForKPI').and.returnValue(of([])),
    getProductManagerByProductId: jasmine.createSpy('getProductManagerByProductId').and.returnValue(of([])),
    getProductName: jasmine.createSpy('getProductName').and.returnValue(of([])),
    getCustomerCAPAApprovalStatus: jasmine.createSpy('getCustomerCAPAApprovalStatus').and.returnValue(of([])),
    getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
    IsCAPAApprovalAllowed: jasmine.createSpy('IsCAPAApprovalAllowed').and.returnValue(of(false))
  };

  const mockMyUtility = {
    setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((date: any) => date),
    Today: jasmine.createSpy('Today').and.returnValue(new Date()),
    serviceError: jasmine.createSpy('serviceError'),
    showWarning: jasmine.createSpy('showWarning'),
    showSuccess: jasmine.createSpy('showSuccess')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiActionPlanComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            editedRow: {
              producT_ID: null,
              servicE_LEVEL_METRICS: '',
              minimuM_SERVICE_LEVEL: '',
              expecteD_SERVICE_LEVEL: '',
              iS_DRAFT: false,
              isdraft: false,
              kpI_ACTUAL: 0,
              capaStage: null,
              id: 1,
              detaiL_ID: 1
            },
            kpiData: [
              {
                kpI_ID: 1,
                kpI_NAME: 'Test KPI',
                projecT_ID: 'PROJ001'
              }
            ],
            selectedPeriod: 'Monthly',
            customerId: 'C001'
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    // Set up localStorage
    localStorage.setItem('empid', 'EMP001');
    localStorage.removeItem('iscapametricview');
    
    fixture = TestBed.createComponent(KpiActionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up localStorage
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
