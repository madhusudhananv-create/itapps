import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskchartControlComponent } from './risk-chart-control.component';

describe('RiskchartControlComponent', () => {
  let component: RiskchartControlComponent;
  let fixture: ComponentFixture<RiskchartControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskchartControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskchartControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
