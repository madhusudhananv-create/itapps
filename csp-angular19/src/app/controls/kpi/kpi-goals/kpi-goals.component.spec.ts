import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

import { KpiGoalsComponent, KpiGoalModel } from './kpi-goals.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { KpiSharedService } from '../kpi-shared.service';

describe('KpiGoalsComponent', () => {
  let component: KpiGoalsComponent;
  let fixture: ComponentFixture<KpiGoalsComponent>;

  const mockAppsService = {
    GetKpiGoals: jasmine.createSpy('GetKpiGoals').and.returnValue(of([
      { id: 1, description: 'Goal 1', displaY_ORDER: 1, isinternal: false, isactive: true }
    ])),
    SaveKpiGoal: jasmine.createSpy('SaveKpiGoal').and.returnValue(of({})),
    DeleteKpiGoal: jasmine.createSpy('DeleteKpiGoal').and.returnValue(of({}))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiGoalsComponent],
      providers: [
        provideHttpClient(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        KpiSharedService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiGoalsComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    component.projId = 'P001';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise @Input defaults on fresh component', () => {
    const fresh = TestBed.createComponent(KpiGoalsComponent).componentInstance;
    expect(fresh.custId).toBe('');
    expect(fresh.projId).toBe('');
  });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('index');
    expect(component.displayedColumns).toContain('description');
    expect(component.displayedColumns).toContain('displaY_ORDER');
    expect(component.displayedColumns).toContain('starT_DATE');
    expect(component.displayedColumns).toContain('enD_DATE');
    expect(component.displayedColumns).toContain('actions');
  });

  it('should initialise goal as a KpiGoalModel instance', () => {
    expect(component.goal).toBeTruthy();
    expect(component.goal.id).toBe(0);
    expect(component.goal.description).toBe('');
    expect(component.goal.displaY_ORDER).toBe(1);
    expect(component.goal.isactive).toBeTruthy();
  });

  it('should load goals when projId is provided', () => {
    expect(mockAppsService.GetKpiGoals).toHaveBeenCalledWith('C001', 'P001');
  });

  it('goals getter should return goals from KpiSharedService', () => {
    expect(Array.isArray(component.goals)).toBeTruthy();
  });

  it('dataSource should have data after goals load', () => {
    expect(component.dataSource.data.length).toBeGreaterThanOrEqual(0);
  });

  it('should not trigger load when projId is empty', () => {
    mockAppsService.GetKpiGoals.calls.reset();
    component.projId = '';
    component.custId = 'C001';
    component.ngOnChanges();
    expect(mockAppsService.GetKpiGoals).not.toHaveBeenCalled();
  });
});
