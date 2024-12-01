import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAssessmentFindingsComponent } from './dashboard-assessment-findings.component';

describe('DashboardAssessmentFindingsComponent', () => {
  let component: DashboardAssessmentFindingsComponent;
  let fixture: ComponentFixture<DashboardAssessmentFindingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardAssessmentFindingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAssessmentFindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
