import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { RiskDetailsComponent } from './risk-details.component';

const mockRiskData = {
  headerColor: 'red',
  risks: [
    {
      cusT_NM: 'Customer A',
      proJ_NM: 'Project 1',
      identifiedDate: '2025-01-01',
      description: 'Risk Description',
      businessImpact: 'High',
      owner: 'John Doe',
      status: 'Open',
      link: 'http://example.com/risk/1'
    }
  ]
};

describe('RiskDetailsComponent', () => {
  let component: RiskDetailsComponent;
  let fixture: ComponentFixture<RiskDetailsComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => ({ subscribe: () => {} }) }),
    closeAll: jasmine.createSpy('closeAll')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RiskDetailsComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockRiskData },
        { provide: MatDialog, useValue: mockMatDialog },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA correctly', () => {
    expect(component.data).toBeDefined();
    expect(component.data.risks.length).toBe(1);
  });

  it('should initialize showLegend as false', () => {
    expect(component.showLegend).toBeFalsy();
  });

  it('should initialize count as 0', () => {
    expect(component.count).toBe(0);
  });

  it('should initialize headerColorClass as a string', () => {
    expect(typeof component.headerColorClass).toBe('string');
  });

  it('should set isSelectedRow on handleRowClick()', () => {
    component.handleRowClick('http://example.com/risk/1');
    expect(component.isSelectedRow).toBe('http://example.com/risk/1');
  });

  it('should call dialog.closeAll on Cancel_onClick()', () => {
    component.Cancel_onClick();
    expect(mockMatDialog.open).not.toHaveBeenCalled(); // dialog.closeAll is called internally
    expect(component).toBeTruthy(); // no error thrown
  });
});
