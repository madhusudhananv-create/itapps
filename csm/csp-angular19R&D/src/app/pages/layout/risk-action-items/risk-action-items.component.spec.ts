import { provideNoopAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RiskActionItemsComponent } from './risk-action-items.component';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('RiskActionItemsComponent', () => {
  let component: RiskActionItemsComponent;
  let fixture: ComponentFixture<RiskActionItemsComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialogRef: any;

  const dialogData = {
    Flag: 'add',
    ProjectName: 'Test Project',
    ProjectId: 'P1',
    CustomerId: 'C1',
    RiskId: 10
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      addActionitem: jasmine.createSpy().and.returnValue(of({ id: 1 })),
      updateActionitemforRisk: jasmine.createSpy().and.returnValue(of({ id: 1 }))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      Today: jasmine.createSpy().and.returnValue(new Date())
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [RiskActionItemsComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: UtilityService, useValue: mockUtil },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(UtilityService, { useValue: mockUtil });
    TestBed.overrideProvider(MatDialogRef, { useValue: mockDialogRef });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskActionItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize from dialog data on init', () => {
    expect(component.projectName).toBe('Test Project');
    expect(component.projectId).toBe('P1');
    expect(component.selectedCust).toBe('C1');
    expect(component.riskId).toBe(10);
    expect(component.isEditMode).toBe(false);
  });

  it('should call addActionitem on SubmitForm in add mode', () => {
    component.isEditMode = false;
    component.EditActionitem.id = 0;
    component.EditActionitem.targeT_DATE = new Date('2025-01-01') as any;
    component.EditActionitem.identifieD_DATE = new Date('2024-01-01') as any;
    component.EditActionitem.description = 'Test';
    component.EditActionitem.status = 'Open';
    component.SubmitForm(true);
    expect(mockAppService.addActionitem).toHaveBeenCalled();
  });

  it('should call updateActionitemforRisk on SubmitForm in edit mode', () => {
    component.isEditMode = true;
    component.EditActionitem.id = 5;
    component.EditActionitem.targeT_DATE = new Date('2025-01-01') as any;
    component.EditActionitem.identifieD_DATE = new Date('2024-01-01') as any;
    component.EditActionitem.description = 'Test';
    component.EditActionitem.status = 'Open';
    component.SubmitForm(true);
    expect(mockAppService.updateActionitemforRisk).toHaveBeenCalled();
  });

  it('should not submit when isValid is false', () => {
    component.SubmitForm(false);
    expect(mockAppService.addActionitem).not.toHaveBeenCalled();
  });

  it('should close dialog when Cancel_onClick is called', () => {
    component.Cancel_onClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should validate dates correctly', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    const pastPast = new Date();
    pastPast.setFullYear(pastPast.getFullYear() - 2);
    expect(component.IsDateValid(future, past)).toBe(true);
    expect(component.IsDateValid(past, future)).toBe(false);
  });

  it('should reset EditActionitem on newEditActionitem', () => {
    component.EditActionitem.description = 'Old Value';
    component.newEditActionitem();
    expect(component.EditActionitem.description).toBeUndefined();
  });
});

