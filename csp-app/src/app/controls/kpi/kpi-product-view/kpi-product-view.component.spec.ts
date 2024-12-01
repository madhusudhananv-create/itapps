import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiProductViewComponent } from './kpi-product-view.component';

describe('KpiProductViewComponent', () => {
  let component: KpiProductViewComponent;
  let fixture: ComponentFixture<KpiProductViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiProductViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiProductViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
