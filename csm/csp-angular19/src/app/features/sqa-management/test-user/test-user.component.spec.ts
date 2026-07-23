import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TestUserComponent } from './test-user.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('TestUserComponent', () => {
  let component: TestUserComponent;
  let fixture: ComponentFixture<TestUserComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockAppService = {
      getTestsControlData: jasmine.createSpy('getTestsControlData').and.returnValue(of([])),
      getControlList: jasmine.createSpy('getControlList').and.returnValue(of([])),
      addTestControls: jasmine.createSpy('addTestControls').and.returnValue(of({})),
      updateTestControls: jasmine.createSpy('updateTestControls').and.returnValue(of({})),
      deleteTestControls: jasmine.createSpy('deleteTestControls').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [TestUserComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_LoadData on init', () => {
      expect(mockAppService.getTestsControlData).toHaveBeenCalled();
    });

    it('should call Service_GetControlList on init', () => {
      expect(mockAppService.getControlList).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize iEditIndex to -1', () => {
      expect(component.iEditIndex).toBe(-1);
    });

    it('should initialize tests as empty array', () => {
      expect(component.tests).toEqual([]);
    });

    it('should initialize controls as empty array', () => {
      expect(component.controls).toEqual([]);
    });

    it('should initialize title as empty string', () => {
      expect(component.title).toBe('');
    });

    it('should have displayedColumns defined', () => {
      expect(component.displayedColumns).toContain('title');
      expect(component.displayedColumns).toContain('controls');
    });
  });

  describe('displayAsAString', () => {
    it('should join control titles with comma', () => {
      const controls = [{ id: 1, title: 'Ctrl A' }, { id: 2, title: 'Ctrl B' }] as any[];
      expect(component.displayAsAString(controls)).toBe('Ctrl A, Ctrl B');
    });

    it('should return "Not Mapped" for empty array', () => {
      expect(component.displayAsAString([])).toBe('Not Mapped');
    });
  });

  describe('AddNewTestRow', () => {
    it('should add a new row to tests array', () => {
      component.tests = [];
      component.AddNewTestRow();
      expect(component.tests.length).toBe(1);
    });

    it('should set iEditIndex to the last index', () => {
      component.tests = [];
      component.AddNewTestRow();
      expect(component.iEditIndex).toBe(0);
    });

    it('should clear title and description', () => {
      component.title = 'Old Title';
      component.description = 'Old Desc';
      component.AddNewTestRow();
      expect(component.title).toBe('');
      expect(component.description).toBe('');
    });
  });

  describe('EditRow_onClick', () => {
    it('should set iEditIndex to the given id', () => {
      const element = {
        procesS_MODEL_TESTS_NEW: { title: 'Test A', description: 'Desc A' },
        procesS_MODEL_CONTROL_NEW: []
      } as any;
      component.EditRow_onClick(element, 2);
      expect(component.iEditIndex).toBe(2);
    });

    it('should populate title and description from element', () => {
      const element = {
        procesS_MODEL_TESTS_NEW: { title: 'Test B', description: 'Desc B' },
        procesS_MODEL_CONTROL_NEW: []
      } as any;
      component.EditRow_onClick(element, 0);
      expect(component.title).toBe('Test B');
      expect(component.description).toBe('Desc B');
    });
  });

  describe('CancelEdit_onClick', () => {
    it('should reset iEditIndex to -1', () => {
      component.iEditIndex = 3;
      component.CancelEdit_onClick();
      expect(component.iEditIndex).toBe(-1);
    });

    it('should clear title and description', () => {
      component.title = 'Some Title';
      component.description = 'Some Desc';
      component.CancelEdit_onClick();
      expect(component.title).toBe('');
      expect(component.description).toBe('');
    });
  });

  describe('SaveRow_onClick', () => {
    it('should call showError when title is empty', () => {
      component.title = '';
      component.description = 'Desc';
      const element = {
        procesS_MODEL_TESTS_NEW: { id: 0, title: '', description: '' },
        procesS_MODEL_CONTROL_NEW: []
      } as any;
      component.SaveRow_onClick(element);
      expect(mockUtil.showError).toHaveBeenCalled();
    });
  });

  describe('Service_LoadData', () => {
    it('should populate tests on success', () => {
      const data = [{ procesS_MODEL_TESTS_NEW: { id: 1, title: 'T1', description: '' }, procesS_MODEL_CONTROL_NEW: [] }];
      mockAppService.getTestsControlData.and.returnValue(of(data));
      component.Service_LoadData();
      expect(component.tests.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getTestsControlData.and.returnValue(throwError(() => new Error('error')));
      component.Service_LoadData();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
