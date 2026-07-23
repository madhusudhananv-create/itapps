import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { BvdQualitativeBenefitsComponent } from './bvd-qualitative-benefits.component';
import { BvdDashboardService } from '../services/bvd-dashboard.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('BvdQualitativeBenefitsComponent', () => {
  let component: BvdQualitativeBenefitsComponent;
  let fixture: ComponentFixture<BvdQualitativeBenefitsComponent>;
  let mockBvdService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError')
    };

    mockBvdService = {
      dashboardStartdate: null,
      dashboardEnddate: null
    };

    TestBed.configureTestingModule({
      imports: [BvdQualitativeBenefitsComponent],
      providers: [
        { provide: BvdDashboardService, useValue: mockBvdService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQualitativeBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set graphData from benefitdata input', () => {
      component.benefitdata = [{ id: 1, title: 'Benefit A' }];
      component.ngOnInit();
      expect(component.graphData).toEqual([{ id: 1, title: 'Benefit A' }]);
    });

    it('should set graphData to undefined then re-assign', () => {
      component.benefitdata = [{ id: 2 }];
      component.ngOnInit();
      expect(component.graphData).toEqual([{ id: 2 }]);
    });
  });

  describe('ngOnChanges', () => {
    it('should update graphData when benefitdata input changes', () => {
      component.benefitdata = [{ id: 10 }];
      component.ngOnChanges();
      expect(component.graphData).toEqual([{ id: 10 }]);
    });
  });

  describe('openDialog', () => {
    it('should open MatDialog with benefitDetaildata', () => {
      component.benefitDetaildata = [{ id: 1 }];
      spyOn<any>(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(null) });
      component.openDialog();
      expect(component['dialog'].open).toHaveBeenCalled();
    });
  });

  describe('getBenefitColorClass', () => {
    it('should return "blue" for "People Improvement"', () => {
      expect(component.getBenefitColorClass('People Improvement')).toBe('blue');
    });

    it('should return "green" for "Process Efficiency"', () => {
      expect(component.getBenefitColorClass('Process Efficiency')).toBe('green');
    });

    it('should return "orange" for "Technology Enhancement"', () => {
      expect(component.getBenefitColorClass('Technology Enhancement')).toBe('orange');
    });

    it('should return "purple" for "Finance Savings"', () => {
      expect(component.getBenefitColorClass('Finance Savings')).toBe('purple');
    });

    it('should return "teal" for "Customer Satisfaction"', () => {
      expect(component.getBenefitColorClass('Customer Satisfaction')).toBe('teal');
    });

    it('should return "default" for unrecognized title', () => {
      expect(component.getBenefitColorClass('Unknown Category')).toBe('default');
    });

    it('should return "default" for empty string', () => {
      expect(component.getBenefitColorClass('')).toBe('default');
    });
  });

  describe('getPillarLabel', () => {
    it('should return "People" for title containing "people"', () => {
      expect(component.getPillarLabel('People Productivity')).toBe('People');
    });

    it('should return "Technology" for title containing "technolog"', () => {
      expect(component.getPillarLabel('Technology Upgrade')).toBe('Technology');
    });

    it('should return empty string for unrecognized title', () => {
      expect(component.getPillarLabel('Unknown')).toBe('');
    });

    it('should return empty string for empty input', () => {
      expect(component.getPillarLabel('')).toBe('');
    });
  });
});
