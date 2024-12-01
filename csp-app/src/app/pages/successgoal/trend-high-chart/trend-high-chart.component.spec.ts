import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendHighChartComponent } from './trend-high-chart.component';

describe('TrendHighChartComponent', () => {
  let component: TrendHighChartComponent;
  let fixture: ComponentFixture<TrendHighChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendHighChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendHighChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
