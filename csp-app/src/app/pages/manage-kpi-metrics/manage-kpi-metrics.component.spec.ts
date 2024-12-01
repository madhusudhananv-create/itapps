import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageKpiMetricsComponent } from './manage-kpi-metrics.component';

describe('ManageKpiMetricsComponent', () => {
  let component: ManageKpiMetricsComponent;
  let fixture: ComponentFixture<ManageKpiMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageKpiMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageKpiMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
