import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiPerspectivesWidgetComponent } from './kpi-perspectives-widget.component';

describe('KpiPerspectivesWidgetComponent', () => {
  let component: KpiPerspectivesWidgetComponent;
  let fixture: ComponentFixture<KpiPerspectivesWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiPerspectivesWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiPerspectivesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
