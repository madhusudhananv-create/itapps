import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { DialogYesNoComponent, DialogYesNoData } from './dialog-yes-no.component';

describe('DialogYesNoComponent', () => {
  let component: DialogYesNoComponent;
  let fixture: ComponentFixture<DialogYesNoComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  // ✅ Use a fresh mockDialogData object for each test to prevent mutation bleeding
  let mockDialogData: DialogYesNoData;

  beforeEach(waitForAsync(() => {
    // ✅ Reset data before each test
    mockDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete?'
      // ✅ No confirmText, cancelText or icon — so defaults ('Yes', 'No', null) apply
    };

    TestBed.configureTestingModule({
      imports: [DialogYesNoComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    mockDialogRef.close.calls.reset(); // ✅ reset spy between tests
    fixture = TestBed.createComponent(DialogYesNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA correctly', () => {
    expect(component.data.title).toBe('Confirm Delete');
    expect(component.data.message).toBe('Are you sure you want to delete?');
  });

  it('should return default confirmText as "Yes"', () => {
    expect(component.confirmText).toBe('Yes');
  });

  it('should return custom confirmText when provided', () => {
    component.data.confirmText = 'Delete';
    expect(component.confirmText).toBe('Delete');
  });

  it('should return default cancelText as "No"', () => {
    expect(component.cancelText).toBe('No');
  });

  it('should return custom cancelText when provided', () => {
    component.data.cancelText = 'Cancel';
    expect(component.cancelText).toBe('Cancel');
  });

  it('should return default confirmColor as "warn"', () => {
    expect(component.confirmColor).toBe('warn');
  });

  it('should return null icon when not provided', () => {
    expect(component.icon).toBeNull();
  });

  it('should return custom icon when provided', () => {
    component.data.icon = 'delete';
    expect(component.icon).toBe('delete');
  });

  it('should initialize isProcessing signal as false', () => {
    expect(component.isProcessing()).toBeFalsy();
  });

  it('should close dialog with false on onCancel()', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true on onConfirm()', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
