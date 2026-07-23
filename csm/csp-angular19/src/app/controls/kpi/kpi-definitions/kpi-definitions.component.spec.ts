import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { KpiDefinitionsComponent } from './kpi-definitions.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { KpiSharedService } from '../kpi-shared.service';
import { AccessControl } from '../../../shared/access-control';

describe('KpiDefinitionsComponent', () => {
  let component: KpiDefinitionsComponent;
  let fixture: ComponentFixture<KpiDefinitionsComponent>;

  const mockAppsService = {
    getServiceAreaList:             jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
    getOverallKPIList:              jasmine.createSpy('getOverallKPIList').and.returnValue(of([])),
    GetKpiDefinitions:              jasmine.createSpy('GetKpiDefinitions').and.returnValue(of([])),
    GetGlobalKpiCategories:         jasmine.createSpy('GetGlobalKpiCategories').and.returnValue(of([])),
    getServiceTowersProjectMapping: jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([])),
    getKpiMasterList:               jasmine.createSpy('getKpiMasterList').and.returnValue(of([])),
    getServiceTowerList:            jasmine.createSpy('getServiceTowerList').and.returnValue(of([])),
    GetCustomerGoals:               jasmine.createSpy('GetCustomerGoals').and.returnValue(of([])),
    getKpiDefinitionList:           jasmine.createSpy('getKpiDefinitionList').and.returnValue(of([])),
    getGlobalCategoryList:          jasmine.createSpy('getGlobalCategoryList').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError:  jasmine.createSpy('serviceError'),
    tableYear:     new Date().getFullYear(),
    getmonthsBasedonYear: jasmine.createSpy('getmonthsBasedonYear').and.returnValue([])
  };

  const mockAccessControl = {
    IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiDefinitionsComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: AppsService,    useValue: mockAppsService },
        { provide: MyUtility,      useValue: mockMyUtility },
        { provide: AccessControl,  useValue: mockAccessControl },
        KpiSharedService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiDefinitionsComponent);
    component = fixture.componentInstance;
    component.custId        = 'C001';
    component.projId        = 'P001';
    component.prodId        = 0;
    component.isProductView = false;
    component.tierId        = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise @Input defaults', () => {
    const fresh = TestBed.createComponent(KpiDefinitionsComponent).componentInstance;
    expect(fresh.custId).toBe('');
    expect(fresh.projId).toBe('');
    expect(fresh.prodId).toBe(0);
    expect(fresh.isProductView).toBeFalsy();
    expect(fresh.tierId).toBe(0);
  });

  it('should initialise isLoading to false', () => {
    expect(component.isLoading).toBeFalsy();
  });

  it('should initialise serviceAreaProjectMappingList and serviceAreaList as empty', () => {
    expect(component.serviceAreaProjectMappingList).toEqual([]);
    expect(component.serviceAreaList).toEqual([]);
  });

  it('should have expandedRow as null initially', () => {
    expect(component.expandedRow).toBeNull();
  });
});
