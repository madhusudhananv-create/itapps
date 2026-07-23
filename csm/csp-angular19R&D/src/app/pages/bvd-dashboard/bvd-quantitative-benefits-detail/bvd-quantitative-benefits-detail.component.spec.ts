import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { BvdQuantitativeBenefitsDetailComponent } from './bvd-quantitative-benefits-detail.component';

describe('BvdQuantitativeBenefitsDetailComponent', () => {
  let component: BvdQuantitativeBenefitsDetailComponent;
  let fixture: ComponentFixture<BvdQuantitativeBenefitsDetailComponent>;
  let mockDialogRef: any;
  let mockDialogData: any;

  beforeEach(waitForAsync(() => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    mockDialogData = {
      DetailsdataQuantitative: [
        { identified_Date: '2024-01-01', idea: 'Idea A', area: 'Finance', responsible: 'Alice', net_Benefits: '5000' },
        { identified_Date: '2024-02-01', idea: 'Idea B', area: 'HR', responsible: 'Bob', net_Benefits: '3000' }
      ]
    };

    TestBed.configureTestingModule({
      imports: [BvdQuantitativeBenefitsDetailComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQuantitativeBenefitsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should populate quantitativebenfits from dialog data', () => {
      expect(component.quantitativebenfits.length).toBe(2);
    });

    it('should initialize dataSource with dialog data', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should handle undefined dialog data gracefully', () => {
      component.data = undefined as any;
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('ngOnChanges', () => {
    it('should refresh dataSource from quantitativebenfits', () => {
      component.quantitativebenfits = [{ identified_Date: '2024-03-01', idea: 'New Idea', area: 'IT', responsible: 'Carol', net_Benefits: '1000' }];
      component.ngOnChanges();
      expect(component.dataSource.data.length).toBe(1);
    });
  });

  describe('displayedColumns', () => {
    it('should contain identifiedDate, idea, area, responsible, savings', () => {
      expect(component.displayedColumns).toContain('identifiedDate');
      expect(component.displayedColumns).toContain('idea');
      expect(component.displayedColumns).toContain('area');
      expect(component.displayedColumns).toContain('responsible');
      expect(component.displayedColumns).toContain('savings');
    });
  });

  describe('onClose', () => {
    it('should call dialog.close()', () => {
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
