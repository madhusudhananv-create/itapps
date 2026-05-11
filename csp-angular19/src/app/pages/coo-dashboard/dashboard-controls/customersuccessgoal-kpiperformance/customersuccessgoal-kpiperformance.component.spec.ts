import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersuccessgoalKpiperformanceComponent } from './customersuccessgoal-kpiperformance.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomersuccessgoalKpiperformanceComponent', () => {
  let component: CustomersuccessgoalKpiperformanceComponent;
  let fixture: ComponentFixture<CustomersuccessgoalKpiperformanceComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CustomersuccessgoalKpiperformanceComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersuccessgoalKpiperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
