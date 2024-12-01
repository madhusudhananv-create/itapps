import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KPITrendByGoalComponent } from './kpi-trend-by-goal.component';

describe('KPITrendByGoalComponent', () => {
  let component: KPITrendByGoalComponent;
  let fixture: ComponentFixture<KPITrendByGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KPITrendByGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KPITrendByGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
