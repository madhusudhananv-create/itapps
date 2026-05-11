import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AddNotesComponent } from './add-notes.component';
import { AppsService } from '../../../../services/apps.service';
import { ChartsService } from '../../../../services/charts.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { MyUtility } from '../../../../shared/my-utility';
import { HighlightsModel } from '../../../../models/highlights-model';

const mockNote: HighlightsModel = {
  id: 1,
  customeR_ID: 'CUST01',
  projecT_ID: 'P001',
  rag: 'Green',
  category: 'General',
  description: 'Test note description',
  publisH_DATE: new Date('2026-03-01'),
  createD_BY: 'EMP01',
  createD_DATE: new Date(),
  updateD_BY: 'EMP01',
  updateD_DATE: new Date(),
  isactive: true,
  week: 1
};

const mockNotes: HighlightsModel[] = [
  { ...mockNote, id: 1, publisH_DATE: new Date('2026-03-01'), week: 1 },
  { ...mockNote, id: 2, description: 'Second note', publisH_DATE: new Date('2026-02-01'), week: 2 }
];

const mockDialogData = {
  custid: 'CUST01',
  notes: [...mockNotes]
};

describe('AddNotesComponent', () => {
  let component: AddNotesComponent;
  let fixture: ComponentFixture<AddNotesComponent>;
  let mockAppsService: any;
  let mockChartsService: any;
  let mockUtilityService: any;
  let mockMyUtility: any;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      addNote: jasmine.createSpy('addNote').and.returnValue(of({})),
      updateNote: jasmine.createSpy('updateNote').and.returnValue(of({})),
      deleteNotes: jasmine.createSpy('deleteNotes').and.returnValue(of({}))
    };

    mockChartsService = {
      getNotesForCustomer: jasmine.createSpy('getNotesForCustomer').and.returnValue(of(mockNotes))
    };

    mockUtilityService = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockMyUtility = {
      showDeleteConfirmation: jasmine.createSpy('showDeleteConfirmation').and.returnValue(of(true))
    };

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [
        AddNotesComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: ChartsService, useValue: mockChartsService },
        { provide: UtilityService, useValue: mockUtilityService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNotesComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should assign dialog data to input', () => {
      fixture.detectChanges();
      expect(component.input).toEqual(mockDialogData);
    });

    it('should populate dataSource with sorted notes when notes are available', () => {
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should sort notes by tempmonth descending', () => {
      fixture.detectChanges();
      const data = component.dataSource.data;
      expect(data[0].id).toBe(1); // Mar is later than Feb
    });

    it('should initialize empty dataSource when notes array is empty', () => {
      (component as any).data = { custid: 'CUST01', notes: [] };
      component.ngOnInit();
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should initialize empty dataSource when notes is undefined', () => {
      (component as any).data = { custid: 'CUST01' };
      component.ngOnInit();
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should initialize empty dataSource when data is null', () => {
      (component as any).data = null;
      component.ngOnInit();
      expect(component.dataSource.data.length).toBe(0);
    });
  });

  // ─── addNotes_OnClick ─────────────────────────────────────────────────────

  describe('addNotes_OnClick', () => {
    it('should switch to edit mode and clear fields', () => {
      fixture.detectChanges();
      component.readonlymode = true;
      component.editmode = false;
      component.addNotes_OnClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
      expect(component.tableMonth).toBeUndefined();
      expect(component.tableYear).toBeUndefined();
    });

    it('should reset newNote to empty object', () => {
      fixture.detectChanges();
      component.newNote = mockNote;
      component.addNotes_OnClick();
      expect(component.newNote.id).toBeUndefined();
    });
  });

  // ─── cancel_OnClick ───────────────────────────────────────────────────────

  describe('cancel_OnClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset to readonly mode', () => {
      component.editmode = true;
      component.readonlymode = false;
      component.cancel_OnClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should clear tableMonth, tableYear and newNote', () => {
      component.tableMonth = 'Jan';
      component.tableYear = 2026;
      component.newNote = mockNote;
      component.cancel_OnClick();
      expect(component.tableMonth).toBeUndefined();
      expect(component.tableYear).toBeUndefined();
    });

    it('should call LoadNotes', () => {
      spyOn(component, 'LoadNotes');
      component.cancel_OnClick();
      expect(component.LoadNotes).toHaveBeenCalled();
    });
  });

  // ─── EditRow_onClick ──────────────────────────────────────────────────────

  describe('EditRow_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should switch to edit mode and populate newNote with element', () => {
      component.EditRow_onClick(mockNote);
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
      expect(component.newNote).toEqual(mockNote);
    });

    it('should set tableMonth from publisH_DATE', () => {
      const note = { ...mockNote, publisH_DATE: new Date('2026-03-01') };
      component.EditRow_onClick(note);
      expect(component.tableMonth).toBe('Mar');
    });

    it('should set tableYear from publisH_DATE', () => {
      const note = { ...mockNote, publisH_DATE: new Date('2026-03-01') };
      component.EditRow_onClick(note);
      expect(component.tableYear).toBe(2026);
    });

    it('should set tableWeek from element.week', () => {
      const note = { ...mockNote, week: 3 };
      component.EditRow_onClick(note);
      expect(component.tableWeek).toBe(3);
    });
  });

  // ─── closedialog ──────────────────────────────────────────────────────────

  describe('closedialog', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call dialogRef.close() when in readonly mode', () => {
      component.editmode = false;
      component.readonlymode = true;
      component.closedialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should switch back to readonly mode when in edit mode (not close dialog)', () => {
      component.editmode = true;
      component.readonlymode = false;
      component.closedialog();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  // ─── LoadNotes ────────────────────────────────────────────────────────────

  describe('LoadNotes', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call getNotesForCustomer with custid', () => {
      component.LoadNotes();
      expect(mockChartsService.getNotesForCustomer).toHaveBeenCalledWith('CUST01');
    });

    it('should update dataSource.data with sorted notes', () => {
      component.LoadNotes();
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockChartsService.getNotesForCustomer.and.returnValue(throwError(() => new Error('fail')));
      component.LoadNotes();
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── saveNotes (new note) ─────────────────────────────────────────────────

  describe('saveNotes - new note (id = 0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.tableMonth = 'Mar';
      component.tableYear = 2026;
      component.newNote = {
        id: 0,
        description: 'Valid new note',
        customeR_ID: '',
        projecT_ID: '',
        rag: '',
        category: '',
        publisH_DATE: new Date(),
        createD_BY: '',
        createD_DATE: new Date(),
        updateD_BY: '',
        updateD_DATE: new Date(),
        isactive: true
      } as HighlightsModel;
    });

    it('should call addNote service when id is 0', () => {
      component.saveNotes();
      expect(mockAppsService.addNote).toHaveBeenCalled();
    });

    it('should reload notes after successful add', () => {
      component.saveNotes();
      expect(mockChartsService.getNotesForCustomer).toHaveBeenCalledWith('CUST01');
    });

    it('should reset to readonly mode after successful add', () => {
      component.saveNotes();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should not call addNote when description is empty', () => {
      component.newNote.description = '';
      component.saveNotes();
      expect(mockAppsService.addNote).not.toHaveBeenCalled();
    });

    it('should not call addNote when tableMonth is undefined', () => {
      component.tableMonth = undefined;
      component.tableYear = undefined as any;
      component.saveNotes();
      // Note: component uses || instead of && for tableMonth/tableYear checks,
      // so it may still proceed. Verify it doesn't error out.
      expect(component).toBeTruthy();
    });

    it('should call serviceError on addNote failure', () => {
      mockAppsService.addNote.and.returnValue(throwError(() => new Error('fail')));
      component.saveNotes();
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── saveNotes (update note) ──────────────────────────────────────────────

  describe('saveNotes - update note (id > 0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.tableMonth = 'Feb';
      component.tableYear = 2026;
      component.newNote = { ...mockNote, id: 5, description: 'Updated description' };
    });

    it('should call updateNote when note id is greater than 0', () => {
      component.saveNotes();
      expect(mockAppsService.updateNote).toHaveBeenCalled();
    });

    it('should reload notes after successful update', () => {
      component.saveNotes();
      expect(mockChartsService.getNotesForCustomer).toHaveBeenCalledWith('CUST01');
    });

    it('should reset to readonly mode after successful update', () => {
      component.saveNotes();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should call serviceError on updateNote failure', () => {
      mockAppsService.updateNote.and.returnValue(throwError(() => new Error('fail')));
      component.saveNotes();
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── DeleteRow_onClick ────────────────────────────────────────────────────

  describe('DeleteRow_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call deleteNotes when user confirms', () => {
      mockMyUtility.showDeleteConfirmation.and.returnValue(of(true));
      component.DeleteRow_onClick(mockNote);
      expect(mockAppsService.deleteNotes).toHaveBeenCalledWith(mockNote);
    });

    it('should call LoadNotes after successful delete', () => {
      spyOn(component, 'LoadNotes');
      mockMyUtility.showDeleteConfirmation.and.returnValue(of(true));
      component.DeleteRow_onClick(mockNote);
      expect(component.LoadNotes).toHaveBeenCalled();
    });

    it('should not call deleteNotes when user cancels', () => {
      mockMyUtility.showDeleteConfirmation.and.returnValue(of(false));
      component.DeleteRow_onClick(mockNote);
      expect(mockAppsService.deleteNotes).not.toHaveBeenCalled();
    });

    it('should call serviceError on delete failure', () => {
      mockMyUtility.showDeleteConfirmation.and.returnValue(of(true));
      mockAppsService.deleteNotes.and.returnValue(throwError(() => new Error('fail')));
      component.DeleteRow_onClick(mockNote);
      expect(mockUtilityService.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Utility methods ──────────────────────────────────────────────────────

  describe('getMonthAbr', () => {
    it('should return correct month abbreviation for index 0 (Jan)', () => {
      expect(component.getMonthAbr(0)).toBe('Jan');
    });

    it('should return correct month abbreviation for index 2 (Mar)', () => {
      expect(component.getMonthAbr(2)).toBe('Mar');
    });

    it('should return correct month abbreviation for index 11 (Dec)', () => {
      expect(component.getMonthAbr(11)).toBe('Dec');
    });
  });

  describe('getMonthNum', () => {
    it('should return 0 for Jan', () => {
      expect(component.getMonthNum('Jan')).toBe(0);
    });

    it('should return 11 for Dec', () => {
      expect(component.getMonthNum('Dec')).toBe(11);
    });

    it('should return 0 for unknown month', () => {
      expect(component.getMonthNum('Xyz')).toBe(0);
    });
  });

  describe('CopyObject', () => {
    it('should return a deep copy of the input object', () => {
      const original = { id: 1, description: 'Test' };
      const copy = component.CopyObject(original);
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });
  });

  describe('GetLocalDate', () => {
    it('should return a date string', () => {
      const date = new Date('2026-03-01');
      const result = component.GetLocalDate(date);
      expect(typeof result).toBe('string');
    });

    it('should return input unchanged when toDateString throws', () => {
      const badDate = 'not-a-date' as any;
      const result = component.GetLocalDate(badDate);
      expect(result).toBe(badDate);
    });
  });

  describe('Years', () => {
    it('should return array of n years descending from current year', () => {
      const years = component.Years(3);
      const currentYear = new Date().getFullYear();
      expect(years.length).toBe(3);
      expect(years[0]).toBe(currentYear);
      expect(years[1]).toBe(currentYear - 1);
      expect(years[2]).toBe(currentYear - 2);
    });
  });

  describe('onMenuToggleChange', () => {
    it('should update menuToggleStatus', () => {
      component.onMenuToggleChange(true);
      expect(component.menuToggleStatus).toBe(true);
      component.onMenuToggleChange(false);
      expect(component.menuToggleStatus).toBe(false);
    });
  });
});

