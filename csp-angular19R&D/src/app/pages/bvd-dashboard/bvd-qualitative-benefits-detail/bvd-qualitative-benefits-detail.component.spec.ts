import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { BvdQualitativeBenefitsDetailComponent } from './bvd-qualitative-benefits-detail.component';

describe('BvdQualitativeBenefitsDetailComponent', () => {
  let component: BvdQualitativeBenefitsDetailComponent;
  let fixture: ComponentFixture<BvdQualitativeBenefitsDetailComponent>;
  let mockDialogRef: any;
  let mockDialogData: any;

  beforeEach(waitForAsync(() => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    mockDialogData = {
      DetailsdataQualitative: [
        { identifiedDate: '2024-01-01', benefit: 'Benefit A', savings: '1000', responsible: 'John', area: 'HR', idea: 'Idea 1' },
        { identifiedDate: '2024-02-01', benefit: 'Benefit B', savings: '2000', responsible: 'Jane', area: 'IT', idea: 'Idea 2' }
      ]
    };

    TestBed.configureTestingModule({
      imports: [BvdQualitativeBenefitsDetailComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQualitativeBenefitsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should populate qualitativeBenefits from dialog data', () => {
      expect(component.qualitativeBenefits.length).toBe(2);
    });

    it('should initialize dataSource with dialog data', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should handle null dialog data gracefully', () => {
      component.data = null as any;
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('displayedColumns', () => {
    it('should contain identifiedDate, idea, area, responsible, benefit', () => {
      expect(component.displayedColumns).toContain('identifiedDate');
      expect(component.displayedColumns).toContain('idea');
      expect(component.displayedColumns).toContain('area');
      expect(component.displayedColumns).toContain('responsible');
      expect(component.displayedColumns).toContain('benefit');
    });
  });

  describe('onClose', () => {
    it('should call dialog.close()', () => {
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
