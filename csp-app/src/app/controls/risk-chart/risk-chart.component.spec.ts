import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskchartComponent } from './risk-chart.component';

describe('RiskchartComponent', () => {
  let component: RiskchartComponent;
  let fixture: ComponentFixture<RiskchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
