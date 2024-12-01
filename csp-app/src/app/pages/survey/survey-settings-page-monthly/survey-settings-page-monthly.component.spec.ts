import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySettingsPageMonthlyComponent } from './survey-settings-page-monthly.component';

describe('SurveySettingsPageMonthlyComponent', () => {
  let component: SurveySettingsPageMonthlyComponent;
  let fixture: ComponentFixture<SurveySettingsPageMonthlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySettingsPageMonthlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsPageMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
