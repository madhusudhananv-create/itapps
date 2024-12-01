import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySettingsPageComponent } from './survey-settings-page.component';

describe('SurveySettingsPageComponent', () => {
  let component: SurveySettingsPageComponent;
  let fixture: ComponentFixture<SurveySettingsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySettingsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
