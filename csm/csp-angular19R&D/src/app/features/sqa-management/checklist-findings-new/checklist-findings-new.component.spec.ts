import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ChecklistFindingsNewComponent } from './checklist-findings-new.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { CheckListExecutionModel } from '../../../shared/models/checklist-execution.model';
import { AuditSampleModel, ObservationModel } from '../../../shared/models/audit-checklist-based.model';

describe('ChecklistFindingsNewComponent', () => {
  let component: ChecklistFindingsNewComponent;
  let fixture: ComponentFixture<ChecklistFindingsNewComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialogRef: any;

  const dialogData = {
    fdata: Object.assign(new CheckListExecutionModel(), {
      customeR_ID: 'C001',
      projecT_ID: 'P001',
      statuS_CATEGORY: 'NMET',
      findings: [],
      checklisT_SAMPLE_AUDITED: []
    }),
    findingsTypes: [{ id: 1, type: 'MAJOR' }, { id: 2, type: 'MINOR' }]
  };

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockAppService = {
      getAuditeeDetails: jasmine.createSpy('getAuditeeDetails').and.returnValue(of([{ id: 1, name: 'Emp A' }]))
    };

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [ChecklistFindingsNewComponent, HttpClientTestingModule],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor / initialization', () => {
    it('should populate checkListdata from dialog data', () => {
      expect(component.checkListdata.customeR_ID).toBe('C001');
      expect(component.checkListdata.projecT_ID).toBe('P001');
    });

    it('should populate findinG_TYPE from dialog data', () => {
      expect(component.findinG_TYPE.length).toBe(2);
    });

    it('should call getAuditeeDetails on construction', () => {
      expect(mockAppService.getAuditeeDetails).toHaveBeenCalledWith('C001', 'P001');
    });

    it('should populate empList on success', () => {
      expect(component.empList.length).toBe(1);
    });
  });

  describe('CancelOnClick', () => {
    it('should close the dialog', () => {
      component.CancelOnClick();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('SaveRows_onClick', () => {
    it('should show success and close when statuS_CATEGORY is not NMET', () => {
      component.checkListdata.statuS_CATEGORY = 'MET';
      component.SaveRows_onClick();
      expect(mockUtil.showSuccess).toHaveBeenCalledWith('Data Saved');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should show error when no mandatory finding description entered', () => {
      component.checkListdata.statuS_CATEGORY = 'NMET';
      const obs = new ObservationModel();
      obs.findinG_CATEGORY = 'MANDATORY';
      obs.findinG_DESCRIPTION = '';
      component.checkListdata.findings = [obs];
      component.SaveRows_onClick();
      expect(mockUtil.showError).toHaveBeenCalledWith('Please enter at least one finding for mandatory type');
    });

    it('should save and close when mandatory finding description is filled', () => {
      component.checkListdata.statuS_CATEGORY = 'NMET';
      const obs = new ObservationModel();
      obs.findinG_CATEGORY = 'MANDATORY';
      obs.findinG_DESCRIPTION = 'Some finding';
      component.checkListdata.findings = [obs];
      component.SaveRows_onClick();
      expect(mockUtil.showSuccess).toHaveBeenCalledWith('Data Saved');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('FillNotCompletedData', () => {
    it('should calculate sampleS_NOTCOMPLIED correctly', () => {
      const sample = new AuditSampleModel();
      sample.totaL_SAMPLES_AUDITED = 10;
      sample.sampleS_COMPLIED = 7;
      component.FillNotCompletedData(sample);
      expect(sample.sampleS_NOTCOMPLIED).toBe(3);
      expect(sample.percentage).toBe(70);
    });

    it('should show error when samples complied exceeds total', () => {
      const sample = new AuditSampleModel();
      sample.totaL_SAMPLES_AUDITED = 5;
      sample.sampleS_COMPLIED = 8;
      component.FillNotCompletedData(sample);
      expect(mockUtil.showError).toHaveBeenCalled();
    });
  });

  describe('AddNewRow', () => {
    it('should add first row when checklisT_SAMPLE_AUDITED is empty', () => {
      component.checkListdata.checklisT_SAMPLE_AUDITED = [];
      component.AddNewRow(component.checkListdata);
      expect(component.checkListdata.checklisT_SAMPLE_AUDITED.length).toBe(1);
    });
  });

  describe('deleteSample', () => {
    it('should remove the sample from checklisT_SAMPLE_AUDITED', () => {
      const sample = new AuditSampleModel();
      component.checkListdata.checklisT_SAMPLE_AUDITED = [sample];
      component.deleteSample(sample);
      expect(component.checkListdata.checklisT_SAMPLE_AUDITED.length).toBe(0);
    });
  });

  describe('checkSample', () => {
    it('should return true when last sample has default initialized fields', () => {
      const sample = new AuditSampleModel();
      component.checkListdata.checklisT_SAMPLE_AUDITED = [sample];
      expect(component.checkSample(component.checkListdata)).toBe(true);
    });

    it('should return true when last sample has at least one field filled', () => {
      const sample = new AuditSampleModel();
      sample.emP_ID = 'EMP001';
      component.checkListdata.checklisT_SAMPLE_AUDITED = [sample];
      expect(component.checkSample(component.checkListdata)).toBe(true);
    });
  });
});
