import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MandatoryTrainingReportComponent } from './mandatory-training-report.component';

describe('MandatoryTrainingReportComponent', () => {
  let component: MandatoryTrainingReportComponent;
  let fixture: ComponentFixture<MandatoryTrainingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MandatoryTrainingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MandatoryTrainingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
