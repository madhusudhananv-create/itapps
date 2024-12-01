import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartsComponent } from './kpi-charts.component';

describe('KpiChartsComponent', () => {
  let component: KpiChartsComponent;
  let fixture: ComponentFixture<KpiChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
