import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';

import { BvdQuantitativeBenefitsComponent } from './bvd-quantitative-benefits.component';
import { BvdDashboardService } from '../services/bvd-dashboard.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('BvdQuantitativeBenefitsComponent', () => {
  let component: BvdQuantitativeBenefitsComponent;
  let fixture: ComponentFixture<BvdQuantitativeBenefitsComponent>;
  let mockBvdService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError')
    };

    mockBvdService = {
      getUOM: jasmine.createSpy('getUOM').and.returnValue(of([{ id: 1, title: 'USD' }])),
      dashboardStartdate: null,
      dashboardEnddate: null
    };

    TestBed.configureTestingModule({
      imports: [BvdQuantitativeBenefitsComponent],
      providers: [
        { provide: BvdDashboardService, useValue: mockBvdService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQuantitativeBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadUOM on init', () => {
      expect(mockBvdService.getUOM).toHaveBeenCalled();
    });

    it('should call chartInit on init setting chart types', () => {
      expect(component.type).toBeDefined();
      expect(component.type1).toBeDefined();
      expect(component.type2).toBeDefined();
    });
  });

  describe('initial state', () => {
    it('should initialize UOM_ID to 1', () => {
      expect(component.UOM_ID).toBe(1);
    });

    it('should initialize selectedView to "benefits"', () => {
      expect(component.selectedView).toBe('benefits');
    });

    it('should initialize isDataEmpty to false', () => {
      expect(component.isDataEmpty).toBe(false);
    });

    it('should initialize typeCategory with 8 entries', () => {
      expect(component.typeCategory.length).toBe(8);
    });
  });

  describe('loadPie', () => {
    it('should populate graphData from Value input', () => {
      component.Value = [{ benefit_Pillar: 'People', net_Benefits: 100 }];
      component.loadPie();
      expect(component.graphData.length).toBe(1);
      expect(component.graphData[0][0]).toBe('People');
      expect(component.graphData[0][1]).toBe(100);
    });

    it('should result in empty graphData when Value is empty', () => {
      component.Value = [];
      component.loadPie();
      expect(component.graphData).toEqual([]);
    });
  });

  describe('loadColumnGraph', () => {
    it('should populate columnGraphData from ValueColumn input', () => {
      component.ValueColumn = [{ months: 'Jan', net_Benefits: 500 }];
      component.loadColumnGraph();
      expect(component.columnGraphData.length).toBe(1);
      expect(component.columnGraphData[0][0]).toBe('Jan');
      expect(component.columnGraphData[0][1]).toBe(500);
    });

    it('should result in empty columnGraphData when ValueColumn is empty', () => {
      component.ValueColumn = [];
      component.loadColumnGraph();
      expect(component.columnGraphData).toEqual([]);
    });
  });

  describe('loadStackedColumn', () => {
    it('should populate stackedData for matching typeCategory entries', () => {
      component.ValueStacked = [{
        improvement_Type: 'Idea', submitted: 1, execution: 2, implemented: 3
      }];
      component.loadStackedColumn();
      expect(component.stackedData.length).toBe(1);
      expect(component.stackedData[0][0]).toBe('Idea');
    });

    it('should result in empty stackedData when ValueStacked is empty', () => {
      component.ValueStacked = [];
      component.loadStackedColumn();
      expect(component.stackedData).toEqual([]);
    });
  });

  describe('loadUOM', () => {
    it('should set UOM_Title from service', () => {
      mockBvdService.getUOM.and.returnValue(of([{ id: 1, title: 'USD' }, { id: 2, title: 'Nos' }]));
      component.loadUOM();
      expect(component.UOM_Title.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockBvdService.getUOM.and.returnValue(throwError(() => new Error('error')));
      component.loadUOM();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('openView', () => {
    it('should open MatDialog with benefitDetaildata', () => {
      component.benefitDetaildata = [{ id: 1 }];
      spyOn<any>(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(null) });
      component.openView();
      expect(component['dialog'].open).toHaveBeenCalled();
    });
  });
});
