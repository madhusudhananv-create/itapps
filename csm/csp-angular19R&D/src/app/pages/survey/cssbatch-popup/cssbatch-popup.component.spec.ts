import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CssbatchPopupComponent } from './cssbatch-popup.component';
import { MyUtility } from '../../../shared/my-utility';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('CssbatchPopupComponent', () => {
  let component: CssbatchPopupComponent;
  let fixture: ComponentFixture<CssbatchPopupComponent>;
  let mockUtil: any;
  let mockDialogRef: any;

  describe('when quarter is false (monthly)', () => {
    beforeEach(waitForAsync(() => {
      mockUtil = {
        getMonthNames: jasmine.createSpy().and.returnValue([
          { title: 'Jan' }, { title: 'Feb' }, { title: 'Mar' },
          { title: 'Apr' }, { title: 'May' }, { title: 'Jun' },
          { title: 'Jul' }, { title: 'Aug' }, { title: 'Sep' },
          { title: 'Oct' }, { title: 'Nov' }, { title: 'Dec' }
        ]),
        tableYear: 2024,
        getMonthNum: jasmine.createSpy().and.returnValue(0),
        Years: jasmine.createSpy('Years').and.returnValue([2022, 2023, 2024])
      };
      mockDialogRef = {
        close: jasmine.createSpy()
      };

      TestBed.configureTestingModule({
        imports: [CssbatchPopupComponent],
        providers: [
          { provide: MyUtility, useValue: mockUtil },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { quarter: false } },
        provideHttpClient(),
        provideAnimations()
      ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CssbatchPopupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should populate months on init when quarter is false', () => {
      expect(component.months.length).toBe(12);
      expect(component.selectedMonth).toBe('Jan');
    });

    it('should close dialog when closePopup is called', () => {
      component.closePopup();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close dialog with month and year on SaveDetails (monthly)', () => {
      component.selectedMonth = 'Mar';
      component.SaveDetails();
      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({
        month: jasmine.any(Number),
        year: 2024
      }));
    });
  });

  describe('when quarter is true', () => {
    beforeEach(waitForAsync(() => {
      mockUtil = {
        getMonthNames: jasmine.createSpy().and.returnValue([]),
        tableYear: 2024,
        getMonthNum: jasmine.createSpy().and.returnValue(0),
        Years: jasmine.createSpy('Years').and.returnValue([2022, 2023, 2024])
      };
      mockDialogRef = {
        close: jasmine.createSpy()
      };

      TestBed.configureTestingModule({
        imports: [CssbatchPopupComponent],
        providers: [
          { provide: MyUtility, useValue: mockUtil },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { quarter: true } },
          provideHttpClient()
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CssbatchPopupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should populate quarters on init when quarter is true', () => {
      expect(component.months).toEqual([
        { title: 'Q1' }, { title: 'Q2' }, { title: 'Q3' }, { title: 'Q4' }
      ]);
      expect(component.selectedMonth).toBe('Q1');
    });

    it('should close dialog with year and sequence on SaveDetails (quarterly)', () => {
      component.selectedMonth = 'Q2';
      component.SaveDetails();
      expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({
        year: 2024,
        sequence: 2
      }));
    });
  });
});
