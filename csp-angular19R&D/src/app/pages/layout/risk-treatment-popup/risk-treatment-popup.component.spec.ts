import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RiskTreatmentPopupComponent } from './risk-treatment-popup.component';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('RiskTreatmentPopupComponent', () => {
  let component: RiskTreatmentPopupComponent;
  let fixture: ComponentFixture<RiskTreatmentPopupComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialogRef: any;

  const dialogData = {
    element: {
      id: 1,
      projecT_ID: 'P1',
      risK_TREATMENT_STRATEGY: 'Mitigate'
    }
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getActionItemsforRisk: jasmine.createSpy().and.returnValue(of([
        { id: 1, description: 'Action 1', status: 'Open' }
      ]))
    };
    mockUtil = {
      serviceError: jasmine.createSpy()
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [RiskTreatmentPopupComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: UtilityService, useValue: mockUtil },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskTreatmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set riskTreatmentStrategy from dialog data', () => {
    expect(component.riskTreatmentStrategy).toBe('Mitigate');
  });

  it('should call getActionItemsforRisk on init', () => {
    expect(mockAppService.getActionItemsforRisk).toHaveBeenCalledWith('P1', 1);
  });

  it('should populate data after successful API call', () => {
    const mockData = [{ id: 1, description: 'Action 1' }];
    mockAppService.getActionItemsforRisk.and.returnValue(of(mockData));
    component.getActionItems('P1', 1);
    expect(component.data).toEqual(mockData);
    expect(component.isLoading).toBe(false);
  });

  it('should handle serviceError on getActionItems failure', () => {
    mockAppService.getActionItemsforRisk.and.returnValue(throwError(() => new Error('error')));
    component.getActionItems('P1', 1);
    expect(mockUtil.serviceError).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});

