import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { OverallStatusPage1Component } from './overall-status-page1.component';
import { HighchartsChartComponent } from 'highcharts-angular';
import { provideHttpClient } from '@angular/common/http';

@Component({ selector: 'highcharts-chart', template: '', standalone: true, host: { 'data-mock': 'true' } })
class MockHighchartsChartComponent {
  @Input() options: any;
  @Input() highcharts: any;
  @Input() constructorType: any;
  @Input() callbackFunction: any;
  @Input() oneToOne: any;
  @Input() runOutsideAngular: any;
  @Input() update: any;
}

describe('OverallStatusPage1Component', () => {
  let component: OverallStatusPage1Component;
  let fixture: ComponentFixture<OverallStatusPage1Component>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ OverallStatusPage1Component ],
      providers: [provideHttpClient()]
    });

    TestBed.overrideComponent(OverallStatusPage1Component, {
      remove: { imports: [HighchartsChartComponent] },
      add: { imports: [MockHighchartsChartComponent] }
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallStatusPage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
