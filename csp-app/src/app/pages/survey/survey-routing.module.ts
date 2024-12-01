import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveySettingsPageMonthlyComponent } from './survey-settings-page-monthly/survey-settings-page-monthly.component';
import { SurveySettingsPageComponent } from './survey-settings-page/survey-settings-page.component';


const routes: Routes = [
{
  path: '',
  component: SurveySettingsPageComponent
 
}
//, {
//   path: 'monthlycss',
//   component: SurveySettingsPageMonthlyComponent,pathMatch:"full"
// }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyRoutingModule { }
