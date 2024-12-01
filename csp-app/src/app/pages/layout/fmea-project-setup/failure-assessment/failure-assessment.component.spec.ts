import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FailureAssessmentComponent } from './failure-assessment.component';

describe('FailureAssessmentComponent', () => {
  let component: FailureAssessmentComponent;
  let fixture: ComponentFixture<FailureAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FailureAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FailureAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
