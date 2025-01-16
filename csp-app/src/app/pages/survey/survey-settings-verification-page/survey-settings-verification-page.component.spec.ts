import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveySettingsVerificationPageComponent } from './survey-settings-verification-page.component';


describe('SurveySettingsPageMonthlyComponent', () => {
  let component: SurveySettingsVerificationPageComponent;
  let fixture: ComponentFixture<SurveySettingsVerificationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySettingsVerificationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsVerificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
