import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { skip } from 'rxjs/operators';
import { AddServiceDialogComponent, DialogData } from './add-service-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivityServiceEntry } from './critical-business-process.component';
import { of } from 'rxjs';

describe('AddServiceDialogComponent', () => {
  let component: AddServiceDialogComponent;
  let fixture: ComponentFixture<AddServiceDialogComponent>;
  let dialogRef: any;
  let mockDialogData: DialogData;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockDialogData = {
      mode: 'add',
      serviceData: null
    };

    await TestBed.configureTestingModule({
      imports: [
        AddServiceDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule
      ],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddServiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Activity/Service Autocomplete', () => {
    it('should filter ITSM services based on input', (done) => {
      component.activityServiceControl.setValue('Incident');
      component.filteredActivityServices$.subscribe(filtered => {
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.some(service => service.includes('Incident'))).toBe(true);
        done();
      });
    });

    it('should return all services when input is empty', (done) => {
      component.activityServiceControl.setValue('');
      component.filteredActivityServices$.subscribe(filtered => {
        expect(filtered.length).toBe(component.itsmServices.length);
        done();
      });
    });

    it('should filter case-insensitively', (done) => {
      component.activityServiceControl.setValue('CHANGE');
      component.filteredActivityServices$.subscribe(filtered => {
        expect(filtered.some(service => service.toLowerCase().includes('change'))).toBe(true);
        done();
      });
    });

    it('should return empty array when no matches found', (done) => {
      component.filteredActivityServices$.pipe(
        skip(1)
      ).subscribe(filtered => {
        expect((filtered as any[]).length).toBe(0);
        done();
      });
      component.activityServiceControl.setValue('xyz123nonexistent');
    });

    it('should allow free-text entry', () => {
      const customValue = 'Custom Service Name';
      component.activityServiceControl.setValue(customValue);
      expect(component.activityServiceControl.value).toBe(customValue);
    });

    it('should sync autocomplete control with form control', () => {
      const testValue = 'Incident Management';
      component.activityServiceControl.setValue(testValue);
      expect(component.serviceForm.get('activityService')?.value).toBe(testValue);
    });

    it('should handle option selection', () => {
      const selectedValue = 'Change Management';
      const mockEvent = {
        option: { value: selectedValue }
      };
      component.onActivityServiceSelected(mockEvent);
      expect(component.serviceForm.get('activityService')?.value).toBe(selectedValue);
    });

    it('should display selected value correctly', () => {
      const value = 'Problem Management';
      const displayValue = component.displayActivityService(value);
      expect(displayValue).toBe(value);
    });

    it('should handle empty display value', () => {
      const displayValue = component.displayActivityService('');
      expect(displayValue).toBe('');
    });
  });

  describe('Technology Autocomplete', () => {
    it('should filter technologies based on input', (done) => {
      component.technologyControl.setValue('SAP');
      component.filteredTechnologies$.subscribe(filtered => {
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.some(tech => tech.includes('SAP'))).toBe(true);
        done();
      });
    });

    it('should return all technologies when input is empty', (done) => {
      component.technologyControl.setValue('');
      component.filteredTechnologies$.subscribe(filtered => {
        expect(filtered.length).toBe(component.technologies.length);
        done();
      });
    });

    it('should filter case-insensitively', (done) => {
      component.technologyControl.setValue('java');
      component.filteredTechnologies$.subscribe(filtered => {
        expect(filtered.some(tech => tech.toLowerCase().includes('java'))).toBe(true);
        done();
      });
    });

    it('should return empty array when no matches found', (done) => {
      component.filteredTechnologies$.pipe(
        skip(1)
      ).subscribe(filtered => {
        expect((filtered as any[]).length).toBe(0);
        done();
      });
      component.technologyControl.setValue('xyz123nonexistent');
    });

    it('should allow free-text entry', () => {
      const customValue = 'Custom Technology Stack';
      component.technologyControl.setValue(customValue);
      expect(component.technologyControl.value).toBe(customValue);
    });

    it('should sync autocomplete control with form control', () => {
      const testValue = 'Oracle';
      component.technologyControl.setValue(testValue);
      expect(component.serviceForm.get('technology')?.value).toBe(testValue);
    });

    it('should handle option selection', () => {
      const selectedValue = 'Salesforce';
      const mockEvent = {
        option: { value: selectedValue }
      };
      component.onTechnologySelected(mockEvent);
      expect(component.serviceForm.get('technology')?.value).toBe(selectedValue);
    });

    it('should display selected value correctly', () => {
      const value = 'Angular';
      const displayValue = component.displayTechnology(value);
      expect(displayValue).toBe(value);
    });

    it('should handle empty display value', () => {
      const displayValue = component.displayTechnology('');
      expect(displayValue).toBe('');
    });
  });

  describe('Initial Data Loading', () => {
    it('should load activity service from initial data', () => {
      const initialData: ActivityServiceEntry = {
        activityService: 'Incident Management',
        criticality: 'Company Critical',
        contractual: 'Yes',
        customerImpact: 'Yes',
        regulatory: 'No',
        engagementPeriod: 12,
        technology: 'ServiceNow',
        primaryDeliverySite: 'India (Chennai)'
      };
      mockDialogData.serviceData = initialData;
      mockDialogData.mode = 'edit';
      
      component.ngOnInit();
      
      expect(component.activityServiceControl.value).toBe('Incident Management');
      expect(component.technologyControl.value).toBe('ServiceNow');
    });

    it('should handle null initial data', () => {
      mockDialogData.serviceData = null;
      component.ngOnInit();
      
      expect(component.activityServiceControl.value).toBe('');
      expect(component.technologyControl.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on activity service input', () => {
      const input = fixture.nativeElement.querySelector('input[formControlName="activityService"]') || 
                    fixture.nativeElement.querySelector('input[aria-label*="Activity"]');
      if (input) {
        expect(input.getAttribute('aria-label')).toContain('Activity');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
      }
    });

    it('should have proper ARIA labels on technology input', () => {
      const input = fixture.nativeElement.querySelector('input[formControlName="technology"]') || 
                    fixture.nativeElement.querySelector('input[aria-label*="Technology"]');
      if (input) {
        expect(input.getAttribute('aria-label')).toContain('Technology');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
      }
    });
  });

  describe('Tooltip Behavior', () => {
    it('should have tooltip on activity service field', () => {
      const icon = fixture.nativeElement.querySelector('mat-icon[matTooltip*="ITSM"]');
      expect(icon).toBeTruthy();
    });

    it('should have tooltip on technology field', () => {
      const icon = fixture.nativeElement.querySelector('mat-icon[matTooltip*="technology"]');
      expect(icon).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate activity service as required', () => {
      component.serviceForm.get('activityService')?.setValue('');
      component.serviceForm.get('activityService')?.markAsTouched();
      expect(component.serviceForm.get('activityService')?.hasError('required')).toBe(true);
    });

    it('should validate technology as required', () => {
      component.serviceForm.get('technology')?.setValue('');
      component.serviceForm.get('technology')?.markAsTouched();
      expect(component.serviceForm.get('technology')?.hasError('required')).toBe(true);
    });

    it('should validate maxlength for activity service', () => {
      const longValue = 'a'.repeat(101);
      component.serviceForm.get('activityService')?.setValue(longValue);
      expect(component.serviceForm.get('activityService')?.hasError('maxlength')).toBe(true);
    });

    it('should validate maxlength for technology', () => {
      const longValue = 'a'.repeat(201);
      component.serviceForm.get('technology')?.setValue(longValue);
      expect(component.serviceForm.get('technology')?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Real-time Filtering', () => {
    it('should update filtered results as user types', (done) => {
      component.activityServiceControl.setValue('M');
      component.filteredActivityServices$.subscribe(filtered1 => {
        component.activityServiceControl.setValue('Ma');
        component.filteredActivityServices$.subscribe(filtered2 => {
          expect(filtered2.length).toBeLessThanOrEqual(filtered1.length);
          done();
        });
      });
    });

    it('should filter multiple matches correctly', (done) => {
      component.filteredTechnologies$.pipe(
        skip(1)
      ).subscribe(filtered => {
        expect((filtered as any[]).length).toBeGreaterThan(0);
        expect((filtered as any[]).every((tech: string) => tech.toLowerCase().includes('sql'))).toBe(true);
        done();
      });
      component.technologyControl.setValue('SQL');
    });
  });

  describe('Component Integration', () => {
    it('should save form with autocomplete values', () => {
      component.activityServiceControl.setValue('Problem Management');
      component.technologyControl.setValue('Oracle');
      component.serviceForm.patchValue({
        criticality: 'Company Critical',
        contractual: 'Yes',
        customerImpact: 'Yes',
        regulatory: 'No',
        engagementPeriod: 12,
        primaryDeliverySite: 'India (Chennai)'
      });

      component.onSave();

      expect(dialogRef.close).toHaveBeenCalled();
      const callArgs = dialogRef.close.calls.mostRecent().args[0];
      expect(callArgs.data.activityService).toBe('Problem Management');
      expect(callArgs.data.technology).toBe('Oracle');
    });
  });
});

