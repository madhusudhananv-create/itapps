import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';

import { KpiProductDetailViewComponent } from './kpi-product-detail-view.component';
import { AppsService } from '../../../../core/services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { AccessControl } from '../../../../shared/access-control';

describe('KpiProductDetailViewComponent', () => {
  let component: KpiProductDetailViewComponent;
  let fixture: ComponentFixture<KpiProductDetailViewComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockDialogData = {
    kpiId: 10,
    kpiDetailId: 20,
    baseMeasureData: [{ id: 1, value: 'val1' }],
    exclusionBaseMeasureData: [],
    enableExclusion: false,
    baseMeasureValId: 5,
    productName: 'Product X'
  };

  const mockAppsService = {
    GetKpiBaseMeasureDetails: jasmine.createSpy('GetKpiBaseMeasureDetails').and.returnValue(of([])),
    SaveKpiBaseMeasure: jasmine.createSpy('SaveKpiBaseMeasure').and.returnValue(of({}))
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
      imports: [KpiProductDetailViewComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiProductDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA correctly', () => {
    expect(component.data).toBe(mockDialogData);
    expect(component.data.productName).toBe('Product X');
  });

  it('should initialise kpiId from dialog data', () => {
    expect(component.kpiId).toBe(10);
  });

  it('should initialise kpiDetailId from dialog data', () => {
    expect(component.kpiDetailId).toBe(20);
  });

  it('should initialise KpiData from dialog baseMeasureData', () => {
    expect(component.KpiData.length).toBe(1);
    expect(component.KpiData[0].id).toBe(1);
  });

  it('should initialise KpiDataExclusion from dialog exclusionBaseMeasureData', () => {
    expect(component.KpiDataExclusion).toEqual([]);
  });

  it('should initialise productName from dialog data', () => {
    expect(component.productName).toBe('Product X');
  });

  it('should initialise enableExclusion from dialog data', () => {
    expect(component.enableExclusion).toBeFalsy();
  });

  it('should initialise loading and progress flags to false', () => {
    expect(component.loading).toBeFalsy();
    expect(component.progress).toBeFalsy();
  });

  it('should initialise isDraft to true', () => {
    expect(component.isDraft).toBeTruthy();
  });

  it('should initialise remarks as empty string', () => {
    expect(component.remarks).toBe('');
  });
});
