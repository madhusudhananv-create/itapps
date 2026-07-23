import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChecklistUserComponent } from './checklist-user.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { ProcessModelModel } from '../../../core/models/process-sqa-model';
import { provideHttpClient } from '@angular/common/http';

describe('ChecklistUserComponent', () => {
  let component: ChecklistUserComponent;
  let fixture: ComponentFixture<ChecklistUserComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAppService = {
      getProcessModel: jasmine.createSpy('getProcessModel').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      addProcessModel: jasmine.createSpy('addProcessModel').and.returnValue(of({})),
      updateProcessModel: jasmine.createSpy('updateProcessModel').and.returnValue(of({})),
      deleteProcessModel: jasmine.createSpy('deleteProcessModel').and.returnValue(of({})),
      deleteProcessModelProcessMapping: jasmine.createSpy('deleteProcessModelProcessMapping').and.returnValue(of({}))
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    TestBed.configureTestingModule({
      imports: [ChecklistUserComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        provideHttpClient()
      ]
    }).overrideComponent(ChecklistUserComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call LoadData on init', () => {
      expect(mockAppService.getProcessModel).toHaveBeenCalled();
    });

    it('should call getServiceAreaProvided on init', () => {
      expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
    });
  });

  describe('LoadData', () => {
    it('should populate modelList on success', () => {
      mockAppService.getProcessModel.and.returnValue(of([{ id: 1, title: 'Model A' }]));
      component.LoadData();
      expect(component.modelList.length).toBe(1);
    });

    it('should set modelList to empty array on failure', () => {
      mockAppService.getProcessModel.and.returnValue(throwError(() => new Error('error')));
      component.LoadData();
      expect(component.modelList.length).toBe(0);
    });
  });

  describe('validateForm', () => {
    it('should return false when title is empty', () => {
      component.model.title = '';
      expect(component.validateForm()).toBe(false);
    });

    it('should return false when releasE_DATE is not set', () => {
      component.model.title = 'Model A';
      component.model.releasE_DATE = undefined as any;
      expect(component.validateForm()).toBe(false);
    });

    it('should return false when title contains only special characters', () => {
      component.model.title = '!!!@@@';
      component.model.releasE_DATE = new Date();
      expect(component.validateForm()).toBe(false);
    });

    it('should return false when title contains only numbers', () => {
      component.model.title = '123456';
      component.model.releasE_DATE = new Date();
      expect(component.validateForm()).toBe(false);
    });

    it('should return true when title and release date are valid', () => {
      component.model.title = 'Valid Model';
      component.model.releasE_DATE = new Date();
      expect(component.validateForm()).toBe(true);
    });
  });

  describe('EditRow_onClick', () => {
    it('should copy the item into the model', () => {
      const item = new ProcessModelModel();
      item.id = 5;
      item.title = 'Model B';
      component.EditRow_onClick(item);
      expect(component.model.id).toBe(5);
      expect(component.model.title).toBe('Model B');
    });
  });

  describe('ClearInputs', () => {
    it('should reset model to a new ProcessModelModel', () => {
      component.model.id = 10;
      component.model.title = 'Old Model';
      component.ClearInputs();
      expect(component.model.id).toBe(0);
      expect(component.model.title).toBe('');
    });
  });

  describe('sortByRetirementDate', () => {
    it('should put models without retirement dates first', () => {
      component.modelList = [
        { id: 1, title: 'B', retiremenT_DATE: new Date('2025-01-01') } as any,
        { id: 2, title: 'A', retiremenT_DATE: undefined } as any
      ];
      component.sortByRetirementDate();
      expect(component.modelList[0].id).toBe(2);
    });
  });

  describe('getServiceAreaProvided', () => {
    it('should populate gavsServiceArea on success', () => {
      mockAppService.getServiceAreaList.and.returnValue(of([{ id: 1, title: 'SA A' }]));
      component.getServiceAreaProvided();
      expect(component.gavsServiceArea.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getServiceAreaList.and.returnValue(throwError(() => new Error('error')));
      component.getServiceAreaProvided();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
