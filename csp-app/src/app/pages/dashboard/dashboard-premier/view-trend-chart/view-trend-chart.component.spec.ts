import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTrendChartComponent } from './view-trend-chart.component';

describe('ViewTrendChartComponent', () => {
  let component: ViewTrendChartComponent;
  let fixture: ComponentFixture<ViewTrendChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTrendChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
