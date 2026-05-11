import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')  // ✅ used in onConfirm() and onCancel()
  };

  const mockDialogData = {
    title: 'Test Title',
    message: 'Test message',
    confirmText: 'Yes',
    cancelText: 'No',
    type: 'warning' as const
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },     // ✅ required: injected in constructor
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }  // ✅ required: @Inject(MAT_DIALOG_DATA)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dialog message', () => {
    expect(component.data.message).toBe('Test message');
  });

  it('should display dialog title', () => {
    expect(component.data.title).toBe('Test Title');
  });

  it('should call dialogRef.close with true on confirm', () => {
    mockDialogRef.close.calls.reset();
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should call dialogRef.close with false on cancel', () => {
    mockDialogRef.close.calls.reset();
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
