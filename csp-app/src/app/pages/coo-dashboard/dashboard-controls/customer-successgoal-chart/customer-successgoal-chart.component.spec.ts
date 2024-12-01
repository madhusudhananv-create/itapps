import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSuccessgoalChartComponent } from './customer-successgoal-chart.component';

describe('CustomerSuccessgoalChartComponent', () => {
  let component: CustomerSuccessgoalChartComponent;
  let fixture: ComponentFixture<CustomerSuccessgoalChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSuccessgoalChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSuccessgoalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
