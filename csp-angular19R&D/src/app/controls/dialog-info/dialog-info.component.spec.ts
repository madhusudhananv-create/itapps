import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { DialogInfoComponent, DialogInfoData } from './dialog-info.component';

describe('DialogInfoComponent', () => {
  let component: DialogInfoComponent;
  let fixture: ComponentFixture<DialogInfoComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const createComponent = (dialogData: DialogInfoData) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DialogInfoComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ]
    });
    fixture = TestBed.createComponent(DialogInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogInfoComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Info Title', message: 'This is an info message.' } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA correctly', () => {
    expect(component.data.title).toBe('Info Title');
    expect(component.data.message).toBe('This is an info message.');
  });

  it('should return default buttonText as "OK" when not provided', () => {
    createComponent({ title: 'Test', message: 'Test message' });
    expect(component.buttonText).toBe('OK');
  });

  it('should return custom buttonText when provided', () => {
    createComponent({ title: 'Test', message: 'Test message', buttonText: 'Close' });
    expect(component.buttonText).toBe('Close');
  });

  it('should return default icon as "info" when not provided', () => {
    createComponent({ title: 'Test', message: 'Test message' });
    expect(component.icon).toBe('info');
  });

  it('should return custom icon when provided', () => {
    createComponent({ title: 'Test', message: 'Test message', icon: 'warning' });
    expect(component.icon).toBe('warning');
  });

  it('should return default iconColor when not provided', () => {
    createComponent({ title: 'Test', message: 'Test message' });
    expect(component.iconColor).toBe('#3b82f6');
  });

  it('should return custom iconColor when provided', () => {
    createComponent({ title: 'Test', message: 'Test message', iconColor: '#ff0000' });
    expect(component.iconColor).toBe('#ff0000');
  });

  it('should close dialog on onClose()', () => {
    mockDialogRef.close.calls.reset(); // Reset spy before test
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
