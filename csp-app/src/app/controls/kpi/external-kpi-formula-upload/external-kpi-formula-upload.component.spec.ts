import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalKpiFormulaUploadComponent } from './external-kpi-formula-upload.component';

describe('ExternalKpiFormulaUploadComponent', () => {
  let component: ExternalKpiFormulaUploadComponent;
  let fixture: ComponentFixture<ExternalKpiFormulaUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalKpiFormulaUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalKpiFormulaUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
