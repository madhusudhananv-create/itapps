import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySettingsMonthlyComponent } from './survey-settings-monthly.component';

describe('SurveySettingsMonthlyComponent', () => {
  let component: SurveySettingsMonthlyComponent;
  let fixture: ComponentFixture<SurveySettingsMonthlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySettingsMonthlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
