import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { ApprovalPopupComponent } from './approval-popup.component';

describe('ApprovalPopupComponent', () => {
  let component: ApprovalPopupComponent;
  let fixture: ComponentFixture<ApprovalPopupComponent>;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [
        ApprovalPopupComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        FormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: 'Test dialog data' },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should receive MAT_DIALOG_DATA', () => {
      expect(component.data).toBe('Test dialog data');
    });

    it('should initialise approvalComments as empty or undefined', () => {
      expect(component.approvalComments == null || component.approvalComments === '').toBe(true);
    });
  });

  // ─── close ────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('should call dialogRef.close with approved=false', () => {
      component.close();
      expect(mockDialogRef.close).toHaveBeenCalledWith({ approved: false });
    });
  });

  // ─── Cancel_onClick ───────────────────────────────────────────────────────

  describe('Cancel_onClick', () => {
    it('should not throw when called', () => {
      expect(() => component.Cancel_onClick()).not.toThrow();
    });
  });

  // ─── SubmitForm ───────────────────────────────────────────────────────────

  describe('SubmitForm', () => {
    it('should not close dialog when form is invalid', () => {
      component.SubmitForm(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog with approved=true when form is valid and comments present', () => {
      component.approvalComments = 'Approved with comments';
      component.SubmitForm(true);
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        approved: true,
        data: 'Approved with comments'
      });
    });

    it('should close dialog with approved=true and empty string when comments are empty', () => {
      component.approvalComments = '';
      component.SubmitForm(true);
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        approved: true,
        data: ''
      });
    });

    it('should pass trimmed/raw comment string as data', () => {
      component.approvalComments = 'Some detailed comment here';
      component.SubmitForm(true);
      const callArg = mockDialogRef.close.calls.mostRecent().args[0];
      expect(callArg.data).toBe('Some detailed comment here');
    });
  });
});
