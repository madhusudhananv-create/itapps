import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiActionPlanComponent } from './kpi-action-plan.component';

describe('KpiActionPlanComponent', () => {
  let component: KpiActionPlanComponent;
  let fixture: ComponentFixture<KpiActionPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiActionPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiActionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
