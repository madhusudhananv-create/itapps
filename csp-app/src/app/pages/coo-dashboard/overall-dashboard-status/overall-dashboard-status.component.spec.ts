import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallDashboardStatusComponent } from './overall-dashboard-status.component';
import { RiskchartComponent } from '../../../controls/risk-chart/risk-chart.component';
import { IssueProgressStatusComponent } from '../../csm-dashboard/csm-customer-dashboard/issue-progress-status/issue-progress-status.component';

describe('OverallDashboardStatusComponent', () => {
  let component: OverallDashboardStatusComponent;
  let fixture: ComponentFixture<OverallDashboardStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverallDashboardStatusComponent,RiskchartComponent, IssueProgressStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallDashboardStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
