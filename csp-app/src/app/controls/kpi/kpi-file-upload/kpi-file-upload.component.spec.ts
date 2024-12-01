import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiFileUploadComponent } from './kpi-file-upload.component';

describe('KpiFileUploadComponent', () => {
  let component: KpiFileUploadComponent;
  let fixture: ComponentFixture<KpiFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
