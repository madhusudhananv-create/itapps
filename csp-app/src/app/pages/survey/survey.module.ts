import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyRoutingModule } from './survey-routing.module';
import { SurveySettingsPageComponent } from './survey-settings-page/survey-settings-page.component';
import { SurveySettingsComponent } from './survey-settings/survey-settings.component';
import { SurveyService } from './survey.service';
import { SharedModule } from '../../Shared/shared.module';

import { CssbatchPopupComponent } from './cssbatch-popup/cssbatch-popup.component';
@NgModule({
  imports: [
    CommonModule,
    SurveyRoutingModule,
    SharedModule
  ],
  declarations: [
    SurveySettingsPageComponent
  ],
  providers: [
    SurveyService
  ]

})
export class SurveyModule { }
