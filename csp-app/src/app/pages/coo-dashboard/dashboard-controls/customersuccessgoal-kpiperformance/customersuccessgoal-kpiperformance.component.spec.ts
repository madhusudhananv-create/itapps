import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSuccessGoalKPIPerformanceComponent } from './customersuccessgoal-kpiperformance.component';

describe('CustomerSuccessGoalKPIPerformanceComponent', () => {
  let component: CustomerSuccessGoalKPIPerformanceComponent;
  let fixture: ComponentFixture<CustomerSuccessGoalKPIPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSuccessGoalKPIPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSuccessGoalKPIPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
