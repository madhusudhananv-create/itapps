import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

import { BestpracticeMatrixComponent } from './bestpractice-matrix.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('BestpracticeMatrixComponent', () => {
  let component: BestpracticeMatrixComponent;
  let fixture: ComponentFixture<BestpracticeMatrixComponent>;

  const mockMatDialogRef = { close: jasmine.createSpy('close') };
  const mockMatDialogData = { processArea: 'All', dept_id: 4 };

  const mockAppsService = {
    GetBestPracticeMatrix: jasmine.createSpy('GetBestPracticeMatrix').and.returnValue(of([])),
    getBestPracticeMatrix: jasmine.createSpy('getBestPracticeMatrix').and.returnValue(of([])),
    GetParametersByType: jasmine.createSpy('GetParametersByType').and.returnValue(of([])),
    getAllProjectsName: jasmine.createSpy('getAllProjectsName').and.returnValue(of([])),
    GetProjects: jasmine.createSpy('GetProjects').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError'),
    IsEditable: jasmine.createSpy('IsEditable').and.returnValue(false)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BestpracticeMatrixComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockMatDialogData },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestpracticeMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise from MAT_DIALOG_DATA', () => {
    expect(component.matData).toBe(mockMatDialogData);
    expect(component.input_deptId).toBe(4);
    expect(component.input_processarea).toBe('All');
  });

  it('should initialise default property values', () => {
    expect(component.input_servicearea).toBe('All');
    expect(component.ddstatus).toBe('All');
    expect(component._loading).toBeFalsy();
    expect(component.legend).toBeFalsy();
    expect(component.itVertical).toBe(0);
  });

  it('should initialise arrays as empty', () => {
    expect(component.matrixdata).toEqual([]);
    expect(component.projData).toEqual([]);
    expect(component.ddProcessArea).toEqual(['All']);
    expect(component.ddServiceArea).toEqual(['All']);
    expect(component.lstStatus).toEqual([]);
  });
});
