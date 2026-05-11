import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

import { MinutesofmeetingComponent } from './minutesofmeeting.component';
import { AppsService } from '../../services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('MinutesofmeetingComponent', () => {
  let component: MinutesofmeetingComponent;
  let fixture: ComponentFixture<MinutesofmeetingComponent>;

  const mockAppsService = {
    GetMomDetails: jasmine.createSpy('GetMomDetails').and.returnValue(of([])),
    getMomsWithDate: jasmine.createSpy('getMomsWithDate').and.returnValue(of([])),
    SaveMom: jasmine.createSpy('SaveMom').and.returnValue(of({ status: 200 })),
    DeleteMom: jasmine.createSpy('DeleteMom').and.returnValue(of({ status: 200 })),
    GetEmpInfo: jasmine.createSpy('GetEmpInfo').and.returnValue(of([]))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MinutesofmeetingComponent],
      providers: [
        provideHttpClient(),
        provideNativeDateAdapter(),
        { provide: AppsService, useValue: mockAppsService },
        MyUtility
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutesofmeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize meetings as empty array', () => {
    expect(component.meetings).toEqual([]);
  });

  it('should initialize updatemode as false', () => {
    expect(component.updatemode).toBeFalsy();
  });

  it('should initialize disablediv as false', () => {
    expect(component.disablediv).toBeFalsy();
  });

  it('should initialize enableDelete as false', () => {
    expect(component.enableDelete).toBeFalsy();
  });

  it('should initialize selectedMoMId as 0', () => {
    expect(component.selectedMoMId).toBe(0);
  });

  it('should initialize customer_list as empty array', () => {
    expect(component.customer_list).toEqual([]);
  });

  it('should initialize project_list as empty array', () => {
    expect(component.project_list).toEqual([]);
  });

  it('should initialize mom object', () => {
    expect(component.mom).toBeDefined();
  });
});
