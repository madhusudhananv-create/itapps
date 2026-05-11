import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarningPopupComponent } from './warning-popup.component';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('WarningPopupComponent', () => {
  let component: WarningPopupComponent;
  let fixture: ComponentFixture<WarningPopupComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')  // ✅ used in onConfirm() and onCancel()
  };

  const mockDialogData = {
    Message: 'Test warning message',
    isConfirmation: true,
    confirmText: 'Yes',
    cancelText: 'No',
    title: 'Warning',
    icon: 'warning',
    actionType: 'default' as const
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningPopupComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },     // ✅ required: injected in constructor
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }  // ✅ required: @Inject(MAT_DIALOG_DATA)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WarningPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display warning message', () => {
    expect(component.data.Message).toBe('Test warning message');
  });

  it('should initialize isConfirmation from dialog data', () => {
    expect(component.isConfirmation).toBeTruthy();
  });

  it('should call dialogRef.close on confirm', () => {
    mockDialogRef.close.calls.reset();
    component.confirm();                          // ✅ actual method name from component
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call dialogRef.close on closeDialog', () => {
    mockDialogRef.close.calls.reset();
    component.closeDialog();                      // ✅ actual method name from component
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });
});
