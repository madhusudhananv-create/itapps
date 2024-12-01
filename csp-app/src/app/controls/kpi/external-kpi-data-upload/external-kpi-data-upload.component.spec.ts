import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalKpiDataUploadComponent } from './external-kpi-data-upload.component';

describe('ExternalKpiDataUploadComponent', () => {
  let component: ExternalKpiDataUploadComponent;
  let fixture: ComponentFixture<ExternalKpiDataUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalKpiDataUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalKpiDataUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
