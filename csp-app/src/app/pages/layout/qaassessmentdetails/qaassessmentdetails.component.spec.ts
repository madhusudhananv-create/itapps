import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaassessmentdetailsComponent } from './qaassessmentdetails.component';

describe('QaassessmentdetailsComponent', () => {
  let component: QaassessmentdetailsComponent;
  let fixture: ComponentFixture<QaassessmentdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaassessmentdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaassessmentdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
