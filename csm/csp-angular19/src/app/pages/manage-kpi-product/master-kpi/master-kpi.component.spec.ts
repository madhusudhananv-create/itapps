import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterKpiComponent } from './master-kpi.component';
import { AppsService } from '../../../core/services/apps.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('MasterKpiComponent', () => {
  let component: MasterKpiComponent;
  let fixture: ComponentFixture<MasterKpiComponent>;
  let mockAppService: any;
  let mockDialogRef: any;

  const dialogData = {
    customerId: 'C1',
    productId: 'PROD1',
    modeId: '1'
  };

  const mockKpiList = [
    {
      kpI_MASTER_ID: 'KPI1',
      kpI_NM: 'Availability',
      servicE_AREA: 'Performance',
      expecteD_SERVICE_LEVEL: '99',
      minimuM_SERVICE_LEVEL: '95',
      uoM: '%'
    },
    {
      kpI_MASTER_ID: 'KPI2',
      kpI_NM: 'Incident Count',
      servicE_AREA: 'Quality',
      expecteD_SERVICE_LEVEL: '5',
      minimuM_SERVICE_LEVEL: '8',
      uoM: 'Number'
    }
  ];

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getAllKpiMasterList: jasmine.createSpy().and.returnValue(of(mockKpiList)),
      addKpiList: jasmine.createSpy().and.returnValue(of({}))
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [MasterKpiComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with data from dialog injection', () => {
    expect(component.customerId).toBe('C1');
    expect(component.productId).toBe('PROD1');
    expect(component.modeId).toBe('1');
  });

  it('should call getAllKpiMasterList on init', () => {
    expect(mockAppService.getAllKpiMasterList).toHaveBeenCalled();
  });

  it('should set kpiList after successful data load', () => {
    expect(component.kpiList).toEqual(mockKpiList);
    expect(component.isLoading).toBe(false);
  });

  it('should set isLoading to false on error', () => {
    mockAppService.getAllKpiMasterList.and.returnValue(throwError(() => new Error('error')));
    component.getAllKPIList();
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog when Cancel_onClick is called', () => {
    component.Cancel_onClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show alert when AddKPI called with no selection', () => {
    spyOn(window, 'alert');
    component.selection.clear();
    component.AddKPI();
    expect(window.alert).toHaveBeenCalledWith('Please select at least one KPI.');
  });

  it('should call addKpiList when KPIs are selected', () => {
    component.kpiList = mockKpiList;
    component.selection.select(mockKpiList[0]);
    component.AddKPI();
    expect(mockAppService.addKpiList).toHaveBeenCalled();
  });

  it('should close dialog with selected data after addKpiList success', () => {
    component.kpiList = mockKpiList;
    component.selection.select(mockKpiList[0]);
    component.AddKPI();
    expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ data: jasmine.any(Array) }));
  });

  it('should clear selection', () => {
    component.selection.select(mockKpiList[0]);
    component.clear();
    expect(component.selection.selected.length).toBe(0);
  });

  it('should return formatted service level with % for uoM=%', () => {
    component.kpiList = mockKpiList;
    const result = component.getmeasurementforServiceLevel('KPI1');
    expect(result).toBe('99%');
  });

  it('should return formatted service level with "per product" for uoM=Number', () => {
    component.kpiList = mockKpiList;
    const result = component.getmeasurementforServiceLevel('KPI2');
    expect(result).toBe('5 per product');
  });

  it('should return formatted min service level with % for uoM=%', () => {
    component.kpiList = mockKpiList;
    const result = component.getmeasurementforMinServiceLevel('KPI1');
    expect(result).toBe('95%');
  });

  it('should return empty string for unknown kpiId', () => {
    component.kpiList = mockKpiList;
    const result = component.getmeasurementforServiceLevel('UNKNOWN');
    expect(result).toBe('');
  });
});
