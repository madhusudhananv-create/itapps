import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

import { AuditqualitystandardsComponent } from './auditqualitystandards.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';

describe('AuditqualitystandardsComponent', () => {
  let component: AuditqualitystandardsComponent;
  let fixture: ComponentFixture<AuditqualitystandardsComponent>;

  const mockActivatedRoute = {
    params: of({})
  };

  const mockAppsService = {
    GetAuditQualityStandardControls: jasmine.createSpy('GetAuditQualityStandardControls').and.returnValue(of([])),
    GetEmpInfoList: jasmine.createSpy('GetEmpInfoList').and.returnValue(of([])),
    GetProcessModelList: jasmine.createSpy('GetProcessModelList').and.returnValue(of([])),
    SaveAuditQualifiedStandard: jasmine.createSpy('SaveAuditQualifiedStandard').and.returnValue(of({}))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AuditqualitystandardsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedService, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditqualitystandardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.editmode).toBeFalsy();
    expect(component.readonlymode).toBeTruthy();
  });

  it('should initialise arrays as empty', () => {
    expect(component.result).toEqual([]);
    expect(component.empList).toEqual([]);
    expect(component.ProcessModelList).toEqual([]);
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('index');
    expect(component.displayedColumns).toContain('frsT_NM');
    expect(component.displayedColumns).toContain('procesS_MODEL');
    expect(component.displayedColumns).toContain('effectivE_FROM');
    expect(component.displayedColumns).toContain('action');
  });
});
