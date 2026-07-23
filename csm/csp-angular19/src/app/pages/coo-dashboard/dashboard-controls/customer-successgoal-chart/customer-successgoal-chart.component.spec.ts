import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSuccessgoalChartComponent } from './customer-successgoal-chart.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerSuccessgoalChartComponent', () => {
  let component: CustomerSuccessgoalChartComponent;
  let fixture: ComponentFixture<CustomerSuccessgoalChartComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CustomerSuccessgoalChartComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSuccessgoalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
