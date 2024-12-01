import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { ReportspageComponent } from './reports-page/reportspage.component';
import { SharedModule } from '../../Shared/shared.module';
import { ReportsService } from './reports.service';


@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule
  ],
  declarations: [ReportsComponent, ReportspageComponent],
  providers: [
    ReportsService
  ]
})
export class ReportsModule { }

