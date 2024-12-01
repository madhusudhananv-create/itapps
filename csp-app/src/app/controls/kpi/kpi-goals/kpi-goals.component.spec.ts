import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiGoalsComponent } from './kpi-goals.component';

describe('KpiGoalsComponent', () => {
  let component: KpiGoalsComponent;
  let fixture: ComponentFixture<KpiGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
