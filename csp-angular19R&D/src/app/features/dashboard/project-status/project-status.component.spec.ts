import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { ProjectStatusComponent } from './project-status.component';

const mockProjectStatus = [
  { month: 'Jan-2026', score: 88, rag: 'Green' },
  { month: 'Feb-2026', score: 72, rag: 'Amber' },
  { month: 'Mar-2026', score: 55, rag: 'Red'   }
];

describe('ProjectStatusComponent', () => {
  let component: ProjectStatusComponent;
  let fixture: ComponentFixture<ProjectStatusComponent>;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [ProjectStatusComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { projectStatus: mockProjectStatus, custName: 'Acme Corp' }
        },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set projectForeCast from dialog data', () => {
      fixture.detectChanges();
      expect(component.projectForeCast).toEqual(mockProjectStatus);
    });

    it('should set customerName from dialog data', () => {
      fixture.detectChanges();
      expect(component.customerName).toBe('Acme Corp');
    });

    it('should not set properties when data is null', () => {
      (component as any).data = null;
      component.ngOnInit();
      expect(component.projectForeCast).toBeUndefined();
      expect(component.customerName).toBe('');
    });
  });

  // ─── closeDialog ──────────────────────────────────────────────────────────

  describe('closeDialog', () => {
    it('should call dialogRef.close()', () => {
      fixture.detectChanges();
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
