import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../Shared/shared.module';
import { SuccessgoalComponent } from './successgoal.component';
import {SuccessgoalRoutingModule} from './successgoal-routing.module';

import { ChartModule } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { TrendHighChartComponent } from './trend-high-chart/trend-high-chart.component';


@NgModule({
    imports: [
      CommonModule,
      SharedModule,
      SuccessgoalRoutingModule,
      ChartModule
    ],
    declarations: [
        SuccessgoalComponent,
        TrendHighChartComponent
    ],
    entryComponents :[TrendHighChartComponent]
  })
  export class SuccessgoalModule { } 
  