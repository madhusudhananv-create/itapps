import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiDefinitionsComponent } from './kpi-definitions.component';

describe('KpiDefinitionsComponent', () => {
  let component: KpiDefinitionsComponent;
  let fixture: ComponentFixture<KpiDefinitionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiDefinitionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiDefinitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
