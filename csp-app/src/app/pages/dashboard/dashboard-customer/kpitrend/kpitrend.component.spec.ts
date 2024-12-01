import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KPITrendComponent } from './kpitrend.component';

describe('KPITrendComponent', () => {
  let component: KPITrendComponent;
  let fixture: ComponentFixture<KPITrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KPITrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KPITrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
