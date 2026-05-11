import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSuccessSurveyComponent } from './customer-success-survey.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerSuccessSurveyComponent', () => {
  let component: CustomerSuccessSurveyComponent;
  let fixture: ComponentFixture<CustomerSuccessSurveyComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CustomerSuccessSurveyComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSuccessSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
