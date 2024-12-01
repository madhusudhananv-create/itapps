import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeSurveyFeedbackComponent } from './take-survey-feedback.component';

describe('TakeSurveyFeedbackComponent', () => {
  let component: TakeSurveyFeedbackComponent;
  let fixture: ComponentFixture<TakeSurveyFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeSurveyFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeSurveyFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
