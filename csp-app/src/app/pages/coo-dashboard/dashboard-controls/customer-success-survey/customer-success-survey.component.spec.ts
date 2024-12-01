import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSuccessSurveyComponent } from './customer-success-survey.component';

describe('CustomerSuccessSurveyComponent', () => {
  let component: CustomerSuccessSurveyComponent;
  let fixture: ComponentFixture<CustomerSuccessSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSuccessSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSuccessSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
