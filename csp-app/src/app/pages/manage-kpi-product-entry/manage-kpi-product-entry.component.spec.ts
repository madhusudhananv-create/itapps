import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageKpiProductEntryComponent } from './manage-kpi-product-entry.component';

describe('ManageKpiProductEntryComponent', () => {
  let component: ManageKpiProductEntryComponent;
  let fixture: ComponentFixture<ManageKpiProductEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageKpiProductEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageKpiProductEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
