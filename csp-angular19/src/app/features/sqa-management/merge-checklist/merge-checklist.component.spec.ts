import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Component } from '@angular/core';

import { MergeChecklistComponent } from './merge-checklist.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControlService } from '../../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

describe('MergeChecklistComponent', () => {
  let component: MergeChecklistComponent;
  let fixture: ComponentFixture<MergeChecklistComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockAppService = {
      getAllChecklists: jasmine.createSpy('getAllChecklists').and.returnValue(of([])),
      mergeChecklists: jasmine.createSpy('mergeChecklists').and.returnValue(of({})),
      addChecklist: jasmine.createSpy('addChecklist').and.returnValue(of({})),
      getMaturityLevel: jasmine.createSpy('getMaturityLevel').and.returnValue(of([])),
      getChecklistWeightage: jasmine.createSpy('getChecklistWeightage').and.returnValue(of([]))
    };

    mockAccess = {
      canCreate: jasmine.createSpy('canCreate').and.returnValue(true),
      canEdit: jasmine.createSpy('canEdit').and.returnValue(true)
    };

    TestBed.configureTestingModule({
      imports: [MergeChecklistComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControlService, useValue: mockAccess },
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(MergeChecklistComponent, {
      set: { imports: [], template: '<div></div>' }
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeChecklistComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getAllChecklistsData on init', () => {
      fixture.detectChanges();
      expect(mockAppService.getAllChecklists).toHaveBeenCalled();
    });
  });

  describe('getAllChecklistsData', () => {
    it('should populate checklists and masterChecklists on success', () => {
      const mockData = [{ id: 1, name: 'Checklist A' }];
      mockAppService.getAllChecklists.and.returnValue(of(mockData));
      component.getAllChecklistsData();
      expect(component.checklists.length).toBe(1);
      expect(component.masterChecklists.length).toBe(1);
    });

    it('should set _loading to false after success', () => {
      mockAppService.getAllChecklists.and.returnValue(of([]));
      component.getAllChecklistsData();
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getAllChecklists.and.returnValue(throwError(() => new Error('error')));
      component.getAllChecklistsData();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });

    it('should set _loading to false on failure', () => {
      mockAppService.getAllChecklists.and.returnValue(throwError(() => new Error('error')));
      component.getAllChecklistsData();
      expect(component._loading).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should initialize isShowCreateChecklist to true', () => {
      expect(component.isShowCreateChecklist).toBe(true);
    });

    it('should initialize isShowChecklistGrid to false', () => {
      expect(component.isShowChecklistGrid).toBe(false);
    });

    it('should initialize _loading to false after init', () => {
      expect(component._loading).toBe(false);
    });
  });
});

describe('MergeChecklistComponent (second)', () => {
  let component: MergeChecklistComponent;
  let fixture: ComponentFixture<MergeChecklistComponent>;

  beforeEach(waitForAsync(() => {
    const mockAppSvc = {
      getAllChecklists: jasmine.createSpy('getAllChecklists').and.returnValue(of([])),
      mergeChecklists: jasmine.createSpy('mergeChecklists').and.returnValue(of({})),
      addChecklist: jasmine.createSpy('addChecklist').and.returnValue(of({})),
      getMaturityLevel: jasmine.createSpy('getMaturityLevel').and.returnValue(of([])),
      getChecklistWeightage: jasmine.createSpy('getChecklistWeightage').and.returnValue(of([]))
    };
    TestBed.configureTestingModule({
      imports: [MergeChecklistComponent],
      providers: [
        { provide: AppsService, useValue: mockAppSvc },
        { provide: MyUtility, useValue: { serviceError: jasmine.createSpy('serviceError'), showError: jasmine.createSpy('showError'), showSuccess: jasmine.createSpy('showSuccess') } },
        { provide: AccessControlService, useValue: { canCreate: jasmine.createSpy('canCreate').and.returnValue(true), canEdit: jasmine.createSpy('canEdit').and.returnValue(true) } },
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(MergeChecklistComponent, {
      set: { imports: [], template: '<div></div>' }
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeChecklistComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
