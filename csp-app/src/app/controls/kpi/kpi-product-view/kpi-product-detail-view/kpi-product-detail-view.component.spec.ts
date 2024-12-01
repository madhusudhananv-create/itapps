import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiProductDetailViewComponent } from './kpi-product-detail-view.component';

describe('KpiProductDetailViewComponent', () => {
  let component: KpiProductDetailViewComponent;
  let fixture: ComponentFixture<KpiProductDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiProductDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiProductDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
